export const getStats = async (signal) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : ''
  const endpoint = normalizedBaseUrl ? `${normalizedBaseUrl}/api/stats` : '/api/stats'

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    const bodyText = await response.text()
    const snippet = bodyText ? ` - ${bodyText.slice(0, 120)}` : ''
    throw new Error(`Request failed: ${response.status} ${response.statusText}${snippet}`)
  }

  if (!isJson) {
    const bodyText = await response.text()
    const snippet = bodyText ? bodyText.slice(0, 160) : 'No response body'
    throw new Error(`Expected JSON but received: ${snippet}`)
  }

  return response.json()
}
