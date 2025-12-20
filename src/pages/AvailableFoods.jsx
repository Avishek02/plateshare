import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { error } from '../lib/feedback'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

function AvailableFoods() {
  const {
    data = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['foods', 'available'],
    queryFn: async () => {
      const res = await api.get('/foods', { params: { status: 'Available' } })
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  useEffect(() => {
    if (isError) error('Failed to load available foods.')
  }, [isError])

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Available Foods"
        message="Something went wrong while loading foods."
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold text-[var(--text)]">
            Available Foods
          </h2>

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
            <span className="inline-block size-2 rounded-full bg-[#f97316]" />
            <span className="truncate">{data.length} items</span>
          </div>
        </div>

        {data.length === 0 && (
          <p className="text-[var(--text-soft)]">No foods available.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map(item => (
            <div
              key={item._id}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)] transition hover:-translate-y-[2px]"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="grid gap-3 p-5">
                <h3 className="text-lg font-extrabold text-[var(--text)]">
                  {item.name}
                </h3>

                <div className="grid gap-1 text-sm text-[var(--text-soft)]">
                  <p>Quantity: {item.quantity || '—'}</p>
                  <p>Pickup: {item.pickupLocation || '—'}</p>
                  <p>
                    Expire:{' '}
                    {item.expireDate
                      ? new Date(item.expireDate).toLocaleDateString()
                      : '—'}
                  </p>
                </div>

                <Link
                  to={`/food/${item._id}`}
                  className="mt-3 inline-flex items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,163,74,.18)]"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AvailableFoods
