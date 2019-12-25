import { useEventlistener } from '../src/index'
import { fn, element } from '../src/useEventListener'
import { renderHook, act } from '@testing-library/react-hooks'

interface params {
  eventName: string
  handler: fn
  element?: element
}

describe('useEventlistener', () => {
  it('should be defined', () => {
    expect(useEventlistener).toBeDefined()
  })

  it('should work right', () => {
    let num = 0
    const handler = () => (num = num + 2)
    const { rerender, unmount } = renderHook(
      ({ eventName, handler, element }: params) => useEventlistener(eventName, handler, element),
      {
        initialProps: {
          eventName: 'click',
          handler: () => num++
        }
      }
    )

    act(() => {
      window.dispatchEvent(new Event('click'))
    })
    expect(num).toEqual(1)

    // handler change
    rerender({
      eventName: 'click',
      handler: handler
    })
    act(() => {
      window.dispatchEvent(new Event('click'))
    })
    expect(num).toEqual(3)

    // element change
    const div = document.createElement('div')
    document.body.appendChild(div)
    rerender({
      eventName: 'click',
      handler: handler,
      element: div
    })
    act(() => {
      div.dispatchEvent(new Event('click'))
    })
    expect(num).toEqual(5)

    // in case element do not support addEventListener
    const div2 = document.createElement('div')
    document.body.appendChild(div2)
    Object.defineProperty(div2, 'addEventListener', {
      get() {
        return false
      }
    })
    rerender({
      eventName: 'click',
      handler: handler,
      element: div2
    })
    act(() => {
      div2.dispatchEvent(new Event('click'))
    })
    expect(num).toEqual(5)

    // nothing change after unmount
    unmount()
    act(() => {
      window.dispatchEvent(new Event('click'))
    })
    expect(num).toEqual(5)
  })
})
