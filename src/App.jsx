import CountCard from './components/CountCard'
import useStats from './hooks/useStats'

const formatTimestamp = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function App() {
  const { data, loading, error } = useStats()
  const errorMessage = error || data?.apiError
  const updatedAt = data?.updatedAt ? formatTimestamp(data.updatedAt) : '—'

  if (loading && !data) {
    return (
      <div className="page">
        <div className="container">
          <h1 className="title">SPEED — 20+ Over</h1>
          <p className="loading">Loading…</p>
          {errorMessage ? (
            <p className="error">Error: {errorMessage}</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">SPEED — 20+ Over</h1>

        <div className="cards">
          <CountCard label="Today" value={data?.dailyOver20 ?? 0} />
          <CountCard label="This week" value={data?.weeklyOver20 ?? 0} />
          <CountCard label="All time" value={data?.allTimeOver20 ?? 0} />
        </div>

        {errorMessage ? <p className="error">Error: {errorMessage}</p> : null}

        <p className="updated">Last updated: {updatedAt}</p>
      </div>
    </div>
  )
}

export default App
