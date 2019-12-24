import { useScript } from '../src/index'
import { renderHook, act } from '@testing-library/react-hooks'

declare global {
  interface window {
    jQuery: typeof $
  }
}

describe('useScript', () => {
  it('should be defined', () => {
    expect(useScript).toBeDefined()
  })

  it('should work right', async () => {
    let url1 = 'url1'
    let url2 = 'url2'
    expect(document.getElementsByTagName('script').length).toEqual(0)
    const { result, rerender } = renderHook(({ url }) => useScript(url), {
      initialProps: { url: url1 }
    })

    // load success
    expect(document.getElementsByTagName('script').length).toEqual(1)

    act(() => {
      document.getElementsByTagName('script')[0].dispatchEvent(new Event('load'))
    })

    expect(result.current[0]).toBeTruthy()
    expect(result.current[1]).toBeFalsy()

    // load error
    rerender({ url: url2 })
    expect(document.getElementsByTagName('script').length).toEqual(2)

    act(() => {
      document.getElementsByTagName('script')[1].dispatchEvent(new Event('error'))
    })

    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(true)
    expect(document.getElementsByTagName('script').length).toEqual(1)

    // load repeat
    rerender({ url: url1 })
    expect(document.getElementsByTagName('script').length).toEqual(1)
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(false)

    // check if cachedScripts splice the fail script
    rerender({ url: url2 })
    let script1: any
    act(() => {
      script1 = document.getElementsByTagName('script')[1]
      script1.dispatchEvent(new Event('error'))
    })
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(true)
    act(() => {
      script1.dispatchEvent(new Event('error'))
    })
    expect(result.current[0]).toBe(true)
    expect(result.current[1]).toBe(true)
  })
})
