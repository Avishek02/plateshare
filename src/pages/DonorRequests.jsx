import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { success, error } from '../lib/feedback'
import { useAuth } from '../auth/AuthProvider'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

function DonorRequests() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const token = localStorage.getItem('token')

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['donor-requests', user?.email],
    enabled: !loading && !!user?.email && !!token,
    queryFn: async () => {
      const res = await api.get('/requests/donor', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  useEffect(() => {
    if (isError) error('Failed to load donation requests.')
  }, [isError])

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, foodId }) => {
      await api.patch(
        `/requests/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (String(status).toLowerCase() === 'accepted' && foodId) {
        await api.patch(
          `/foods/${foodId}`,
          { status: 'Donated' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    },
    onSuccess: () => {
      success('Request status updated.')
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
    },
    onError: err => {
      const msg = err?.response?.data?.message || 'Failed to update request status.'
      error(msg)
    }
  })

  const handleStatus = (r, status) => {
    statusMutation.mutate({
      id: r._id,
      status,
      foodId: r.food?._id
    })
  }

  if (loading || isLoading) return <Loading />

  if (!user) {
    return (
      <ErrorState
        title="Donation Requests"
        message="Please login to view donation requests."
      />
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="Donation Requests"
        message="Something went wrong while loading donation requests."
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold text-[var(--text)]">
            Donation Requests
          </h2>

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
            <span className="inline-block size-2 rounded-full bg-[#f97316]" />
            <span className="truncate">{data.length} requests</span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <p className="text-[var(--text-soft)]">You have no incoming requests.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left text-sm">
                <thead>
                  <tr className="[background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff]">
                    <th className="p-4 font-extrabold text-[var(--text)]">Food</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Requester</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Email</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Location</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Reason</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Contact</th>
                    <th className="p-4 font-extrabold text-[var(--text)]">Status</th>
                    <th className="p-4 font-extrabold text-[var(--text)] !text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map(r => {
                    const st = (r.status || '').toLowerCase()
                    const hideActions = st === 'accepted' || st === 'rejected'

                    return (
                      <tr key={r._id} className="border-t border-[var(--border)]">
                        <td className="p-4 font-semibold text-[var(--text)]">
                          {r.food?._id ? (
                            <Link
                              to={`/food/${r.food._id}`}
                              className="text-[var(--accent)] hover:underline"
                            >
                              {r.food?.name || 'View Food'}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-4 text-[var(--text-soft)]">{r.requesterName || '—'}</td>
                        <td className="p-4 text-[var(--text-soft)]">{r.requesterEmail || '—'}</td>
                        <td className="p-4 text-[var(--text-soft)]">{r.location || '—'}</td>
                        <td className="p-4 text-[var(--text-soft)]">{r.reason || '—'}</td>
                        <td className="p-4 text-[var(--text-soft)]">{r.contactNo || '—'}</td>

                        <td className="p-4">
                          <span
                            className="inline-flex rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold capitalize"
                            style={{
                              backgroundColor:
                                st === 'accepted'
                                  ? 'var(--accepted-status-bg)'
                                  : st === 'rejected'
                                    ? 'var(--rejected-status-bg)'
                                    : 'var(--pending-status-bg)',
                              color:
                                st === 'accepted'
                                  ? 'var(--accepted-status-text)'
                                  : st === 'rejected'
                                    ? 'var(--rejected-status-text)'
                                    : 'var(--pending-status-text)'
                            }}
                          >
                            {st || 'pending'}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            {hideActions ? null : (
                              <>
                                <button
                                  disabled={statusMutation.isPending}
                                  onClick={() => handleStatus(r, 'Accepted')}
                                  className="rounded-2xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-1 text-sm font-bold text-white disabled:opacity-50"
                                >
                                  Accept
                                </button>
                                <button
                                  disabled={statusMutation.isPending}
                                  onClick={() => handleStatus(r, 'Rejected')}
                                  className="rounded-2xl bg-[rgba(239,68,68,.15)] px-4 py-1 text-sm font-bold text-[var(--danger)] disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonorRequests
