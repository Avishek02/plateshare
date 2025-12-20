import { Link, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import api from '../lib/api'
import Loading from '../components/Loading'
import { confirmDelete, success, error } from '../lib/feedback'
import { useMemo, useState, useEffect } from 'react'
import ErrorState from '../components/ErrorState'

function ManageFoods() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const email = user?.email || ''
  const [deletingId, setDeletingId] = useState(null)

  const queryKey = useMemo(() => ['my-foods', email], [email])

  const { data = [], isLoading, isError } = useQuery({
    queryKey,
    enabled: !loading && !!email,
    queryFn: async () => {
      const res = await api.get('/foods/my')
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  useEffect(() => {
    if (isError) error('Failed to load your foods.')
  }, [isError])

  const deleteMutation = useMutation({
    mutationFn: async id => {
      setDeletingId(id)
      return api.delete(`/foods/${id}`)
    },
    onSuccess: () => {
      success('Food deleted successfully.')
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
    },
    onError: () => {
      error('Failed to delete food.')
    },
    onSettled: () => setDeletingId(null)
  })

  const handleDelete = async id => {
    const ok = await confirmDelete()
    if (!ok) return
    deleteMutation.mutate(id)
  }

  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (isLoading) return <Loading />

  if (isError) {
    return (
      <ErrorState
        title="Manage My Foods"
        message="Something went wrong while loading your foods. Please try again."
        onRetry={() => queryClient.invalidateQueries({ queryKey })}
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-extrabold text-[var(--text)]">Manage My Foods</h2>

          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
            <span className="inline-block size-2 rounded-full bg-[#f97316]" />
            <span className="truncate">{data.length} items</span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <p className="text-[var(--text-soft)]">You have no foods yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full border-collapse">
<thead>
  <tr className="[background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff]">
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Food</th>
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Quantity</th>
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Pickup</th>
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Status</th>
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Expire Date</th>
    <th className="p-4 text-left text-sm font-extrabold text-[var(--text)]">Actions</th>
  </tr>
</thead>



                <tbody>
                  {data.map(item => {
                    const isDeleting = deletingId === item._id
                    return (
                      <tr key={item._id} className="border-t border-[var(--border)]">
                        <td className="p-4 text-sm font-semibold text-[var(--text)]">{item.name || '—'}</td>
                        <td className="p-4 text-sm text-[var(--text-soft)]">{item.quantity || '—'}</td>
                        <td className="p-4 text-sm text-[var(--text-soft)]">{item.pickupLocation || '—'}</td>
                        <td className="p-4 text-sm text-[var(--text-soft)]">{item.status || '—'}</td>
                        <td className="p-4 text-sm text-[var(--text-soft)]">
                          {item.expireDate ? new Date(item.expireDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/food/${item._id}`}
                              className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-bold text-[var(--text)] shadow-[0_10px_24px_rgba(2,6,23,.08)] hover:-translate-y-[1px] transition"
                            >
                              View
                            </Link>

                            <Link
                              to={`/update-food/${item._id}`}
                              className="inline-flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-bold text-[var(--text)] shadow-[0_10px_24px_rgba(2,6,23,.08)] hover:-translate-y-[1px] transition"
                            >
                              Update
                            </Link>

                            <button
                              onClick={() => handleDelete(item._id)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.10)] px-3 py-2 text-sm font-extrabold text-[var(--danger)] disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
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

export default ManageFoods
