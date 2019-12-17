import React, { useEffect, useRef, MutableRefObject } from 'react'

type domType = HTMLElement | (() => HTMLElement | null) | null

export default function useOnClickOutside<T extends HTMLElement>(
    dom: domType,
    handler: (e: MouseEvent) => void
) {
    const ref = useRef<T>()

    useEffect(
      () => {
        const listener = (event: MouseEvent) => {
            let el = (typeof dom === 'function' ? dom() : dom) || ref.current
            if (!el || el.contains(event.target as T)) {
                return
            }
  
            handler(event)
        }
  
        document.addEventListener('click', listener)
  
        return () => {
          document.removeEventListener('click', listener)
        }
      },

      [dom, handler]
    )

    return ref as MutableRefObject<T>
  }