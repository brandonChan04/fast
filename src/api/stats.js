export const fetchStats = async (baseUrl, signal) => {
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : ''
  const endpoint = normalizedBaseUrl ? `${normalizedBaseUrl}/api/stats` : '/api/stats'

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
