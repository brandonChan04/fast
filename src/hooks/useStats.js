import { useEffect, useRef, useState } from 'react'
import { fetchStats } from '../api/stats'

const POLL_INTERVAL_MS = 10000

const useStats = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dataRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    let abortController = null

    const runFetch = async () => {
      if (abortController) {
        abortController.abort()
      }

      abortController = new AbortController()
      const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

      try {
        const result = await fetchStats(baseUrl, abortController.signal)
        if (!isMounted) return

        dataRef.current = result
        setData(result)
        setError(null)
        setLoading(false)
      } catch (err) {
        if (!isMounted) return
        if (err?.name === 'AbortError') return

        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
        setLoading(dataRef.current == null)
      }
    }

    runFetch()
    const intervalId = setInterval(runFetch, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(intervalId)
      if (abortController) {
        abortController.abort()
      }
    }
  }, [])

  return { data, loading, error }
}

export default useStats
