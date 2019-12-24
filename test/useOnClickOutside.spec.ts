import { useClickOutside } from '../src/index'
import { renderHook } from '@testing-library/react-hooks'

describe('useClickOutside', () => {
  it('should be defined', () => {
    expect(useClickOutside).toBeDefined()
  })

  let container1: HTMLElement
  let container2: HTMLElement
  beforeEach(() => {
    container1 = document.createElement('div')
    container2 = document.createElement('div')
    document.body.appendChild(container1)
    document.body.appendChild(container2)
  })
  afterEach(() => {
    document.body.removeChild(container1)
    document.body.removeChild(container2)
  })

  it('should work right', () => {
    let count = 0
    const { rerender, unmount } = renderHook((dom: HTMLElement | (() => HTMLElement)) =>
      useClickOutside(dom, () => {
        count++
      })
    )

    document.body.click()
    expect(count).toEqual(0)

    rerender(container1)
    container1.click()
    expect(count).toEqual(0)
    document.body.click()
    expect(count).toEqual(1)
    container2.click()
    expect(count).toEqual(2)

    rerender(() => container2)
    container2.click()
    expect(count).toEqual(2)
    container1.click()
    expect(count).toEqual(3)
    document.body.click()
    expect(count).toEqual(4)

    unmount()
    document.body.click()
    expect(count).toEqual(4)
  })
})
