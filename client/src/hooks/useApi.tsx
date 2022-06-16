import axios, { AxiosRequestConfig } from "axios"
import { useEffect, useState } from "react"
import { useDeepCompareEffect } from 'react-use'

export const useApi = <T,>(url: string, config?: AxiosRequestConfig) => {
  const [data, setData] = useState<T>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()

  useDeepCompareEffect(() => {
    setLoading(true)
    axios.get<T>(url, config)
      .then(res => { setData(res.data); setLoading(false) })
      .catch(err => setError(err))
  }, [url, config])

  return { data, loading, error }
}
