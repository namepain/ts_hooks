import { DependencyList, useEffect, useState, useCallback, useRef } from 'react'

export default function useAsync(
  fn: (...args: any[]) => Promise<any>,
  deps?: DependencyList | boolean,
  immediate: boolean = true
) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(null)
  const [error, setError] = useState(null)
  const ref = useRef({
    count: 0,
    fn,
    immediate
  })

  if (typeof deps === 'boolean') {
    ref.current.immediate = deps
    deps = []
  }
  if (deps === undefined) {
    deps = []
  }

  const run = useCallback(async (...args) => {
    const uid = ++ref.current.count
    try {
      setLoading(true)
      const value = await ref.current.fn(...args)
      if (uid === ref.current.count) {
        setValue(value)
        setError(null)
        setLoading(false)
      }
    } catch (error) {
      if (uid === ref.current.count) {
        setValue(null)
        setError(error)
        setLoading(false)
      }
    }
  }, deps)

  const cancel = useCallback(() => {
    setLoading(false)
    ref.current.count++
  }, [])

  useEffect(() => {
    if (ref.current.immediate) {
      // tslint:disable-next-line:no-floating-promises
      run(...(deps as DependencyList))
    }
    // ignore request after unmount
    return () => {
      ++ref.current.count
    }
  }, [run])

  return { loading, value, error, run, cancel }
}
