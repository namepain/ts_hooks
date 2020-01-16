import { DependencyList } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { useAsync } from '../src/index'

type params = {
  fn: (...args: any[]) => Promise<any>
  deps?: boolean | DependencyList
  immediate?: boolean
}

describe('useAsync', () => {
  it('should be defined', () => {
    expect(useAsync).toBeDefined()
  })

  it('should work right', async () => {
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ fn, deps, immediate }: params) => useAsync(fn, deps, immediate),
      {
        initialProps: {
          fn: (a: unknown) => new Promise(r => setTimeout(() => r(a), 100)),
          deps: ['first']
        }
      }
    )

    expect(result.current.loading).toBe(true)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe(null)
    expect(typeof result.current.run === 'function').toBe(true)
    expect(typeof result.current.cancel === 'function').toBe(true)

    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe('first')
    expect(result.current.error).toBe(null)

    // deps change
    rerender({
      fn: (a: unknown) => new Promise(r => setTimeout(() => r(a), 100)),
      deps: ['second']
    })
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe('second')
    expect(result.current.error).toBe(null)
  })

  it('should work when promise reject', async () => {
    const fn = jest.fn()
    const fn1 = jest.fn()
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ fn, deps, immediate }: params) => useAsync(fn, deps, immediate),
      {
        initialProps: {
          fn: (a: unknown) => {
            fn()
            return new Promise((_, r) =>
              setTimeout(() => {
                fn1(), r(a)
              }, 100)
            )
          },
          deps: ['first'],
          immediate: false
        }
      }
    )

    act(() => {
      result.current.run('reject')
    })
    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(fn).toBeCalledTimes(1)
    expect(fn1).toBeCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe('reject')

    // cancel change
    act(() => {
      result.current.run('reject2')
      result.current.cancel()
    })

    expect(fn).toBeCalledTimes(2)
    expect(fn1).toBeCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe('reject')
  })

  it('should work when not deps arr', async () => {
    const fn = jest.fn()
    const fn1 = jest.fn()
    const rejectFn = (a: unknown, deley?: number) => {
      fn()
      return new Promise((_, r) =>
        setTimeout(() => {
          fn1(), r(a)
        }, deley || 100)
      )
    }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ fn, deps, immediate }: params) => useAsync(fn, deps, immediate),
      {
        initialProps: {
          fn: rejectFn,
          deps: false
        }
      }
    )

    act(() => {
      result.current.run('reject')
    })
    expect(result.current.loading).toBe(true)

    await waitForNextUpdate()
    expect(fn).toBeCalledTimes(1)
    expect(fn1).toBeCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe('reject')

    // cancel
    act(() => {
      result.current.run('reject2')
      result.current.cancel()
    })

    expect(fn).toBeCalledTimes(2)
    expect(fn1).toBeCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe('reject')
  })

  it('should work when deps undefined', async () => {
    jest.useFakeTimers()

    const fn = jest.fn()
    const fn1 = jest.fn()
    const rejectFn = (a: unknown, deley?: number, isResolve?: boolean) => {
      fn()
      return new Promise((_, r) =>
        setTimeout(() => {
          if (isResolve) {
            fn1()
            _(a)
          } else {
            fn1()
            r(a)
          }
        }, deley || 100)
      )
    }
    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ fn, deps, immediate }: params) => useAsync(fn, deps, immediate),
      {
        initialProps: {
          fn: rejectFn
        }
      }
    )
    expect(fn).toBeCalledTimes(1)
    expect(fn1).toBeCalledTimes(0)
    expect(result.current.loading).toBe(true)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe(null)

    jest.runAllTimers()
    await waitForNextUpdate()
    expect(fn).toBeCalledTimes(1)
    expect(fn1).toBeCalledTimes(1)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe(undefined)

    // race condition
    act(() => {
      result.current.run('reject3', 1000)
      result.current.run('reject4', 100)
    })

    jest.runAllTimers()
    await waitForNextUpdate()
    expect(fn).toBeCalledTimes(3)
    expect(fn1).toBeCalledTimes(3)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe(null)
    expect(result.current.error).toBe('reject4')

    // race condition
    act(() => {
      result.current.run('reject5', 1000, true)
      result.current.run('reject6', 100, true)
    })

    jest.runAllTimers()
    await waitForNextUpdate()
    expect(fn).toBeCalledTimes(5)
    expect(fn1).toBeCalledTimes(5)
    expect(result.current.loading).toBe(false)
    expect(result.current.value).toBe('reject6')
    expect(result.current.error).toBe(null)

    jest.useRealTimers()
  })
})
