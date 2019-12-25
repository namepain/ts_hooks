import { useEffect, useRef } from 'react'

type eventElement = Element | HTMLDocument | Window
export type fn = (e: Event) => any
export type element = eventElement | null

function useEventListener(eventName: string, handler: fn, element?: element): void

function useEventListener(eventName: string, handler: fn, element: element = window) {
  const savedHandler = useRef<fn>(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) => savedHandler.current(event)
    ;(element as eventElement).addEventListener(eventName, eventListener)

    return () => {
      ;(element as eventElement).removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

export default useEventListener
