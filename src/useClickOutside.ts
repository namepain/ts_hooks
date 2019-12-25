import React, { useEffect, useRef, MutableRefObject } from 'react'

type domType = HTMLElement | (() => HTMLElement | null) | null

export default function useClickOutside<T extends HTMLElement>(
  dom: domType,
  handler: (e: MouseEvent) => void
) {
  // Provide a ref object in case there is no dom passed in
  const ref = useRef<T>()

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      let el = (typeof dom === 'function' ? dom() : dom) || ref.current

      // Do nothing when dom contains event target
      if (!el || el.contains(event.target as T)) {
        return
      }

      handler(event)
    }

    document.addEventListener('click', listener)

    return () => {
      document.removeEventListener('click', listener)
    }
  }, [dom, handler])

  // Return the ref
  return ref as MutableRefObject<T>
}
