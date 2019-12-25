import { renderHook, act } from '@testing-library/react-hooks'
import { useInterval } from '../src/index'

type params = {
  fn: () => any
  delay?: number | null
  immediate?: boolean
}

describe('useInterval', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should be defined', () => {
    expect(useInterval).toBeDefined()
  })

  it('should work right', () => {
    let fn = jest.fn()
    let fn1 = jest.fn()
    expect(setTimeout).toHaveBeenCalledTimes(0)
    const { result, rerender } = renderHook(
      ({ fn, delay, immediate }: params) => useInterval(fn, delay, immediate),
      {
        initialProps: {
          fn,
          delay: 0
        }
      }
    )

    expect(fn).not.toBeCalled()
    jest.advanceTimersByTime(3000)
    expect(fn).not.toBeCalled()

    // delay changed
    rerender({ fn, delay: 100 })

    expect(fn).not.toBeCalled()
    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(100)
    expect(fn).toHaveBeenCalledTimes(2)

    // stop
    result.current.stop()
    jest.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(2)

    // resume
    result.current.resume()
    expect(fn).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(4)

    // callback change
    rerender({ fn: fn1, delay: 100 })
    jest.advanceTimersByTime(200)
    expect(fn).toHaveBeenCalledTimes(4)
    expect(fn1).toHaveBeenCalledTimes(2)

    // immediate change
    rerender({ fn: fn1, delay: 100, immediate: true })
    expect(fn).toHaveBeenCalledTimes(4)
    expect(fn1).toHaveBeenCalledTimes(3)
    jest.advanceTimersByTime(200)
    expect(fn1).toHaveBeenCalledTimes(5)
  })
})
