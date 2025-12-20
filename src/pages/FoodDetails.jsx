import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { success, error } from '../lib/feedback'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

function FoodDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const token = localStorage.getItem('token')
  const { register, handleSubmit, reset } = useForm()

  const foodQuery = useQuery({
    queryKey: ['food', id],
    enabled: !!id && !!token,
    queryFn: async () => {
      const res = await api.get(`/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    retry: 1
  })

  const food = foodQuery.data

  const isDonor = useMemo(
    () => !!user && food?.donor?.email === user.email,
    [user, food]
  )

  const requestsQuery = useQuery({
    queryKey: ['food-requests', id],
    enabled: !!id && !!token && !!user && isDonor,
    queryFn: async () => {
      const res = await api.get('/requests', {
        params: { foodId: id },
        headers: { Authorization: `Bearer ${token}` }
      })
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  useEffect(() => {
    if (foodQuery.isError) error('Failed to load food details.')
  }, [foodQuery.isError])

  useEffect(() => {
    if (requestsQuery.isError) error('Failed to load requests.')
  }, [requestsQuery.isError])

  const requestMutation = useMutation({
    mutationFn: async values => {
      await api.post(
        '/requests',
        {
          foodId: id,
          location: values.location,
          reason: values.reason,
          contactNo: values.contactNo
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    },
    onSuccess: () => {
      reset()
      setIsModalOpen(false)
      success('Request submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['food-requests', id] })
    },
    onError: err => {
      error(err?.response?.data?.message || 'Request failed.')
    }
  })

  const statusMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      await api.patch(
        `/requests/${requestId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (status === 'accepted') {
        await api.patch(
          `/foods/${id}/status`,
          { status: 'donated' },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    },
    onSuccess: () => {
      success('Request status updated.')
      queryClient.invalidateQueries({ queryKey: ['food-requests', id] })
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['food', id] })
    },
    onError: err => {
      error(err?.response?.data?.message || 'Failed to update request status.')
    }
  })

  if (foodQuery.isLoading) return <Loading />

  if (foodQuery.isError || !food) {
    return (
      <ErrorState
        title="Food Details"
        message="Something went wrong while loading this food."
      />
    )
  }

  const canRequest =
    !isDonor && !!user && (food.status || '').toLowerCase() === 'available'

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_14px_40px_rgba(2,6,23,.10)]">
          <div className="p-5 border-b border-[var(--border)] mb-4 [background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff] rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-extrabold text-[var(--accent)]">{food.name}</h2>


              <span className="inline-flex rounded-full px-4 py-1.5 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
                <span className="inline-block size-2 rounded-full bg-[#f97316]" />

                <span className='truncate'>{food.status}</span>
              </span>

            </div>
          </div>

          <div className="grid gap-5 px-5 pb-10">
            {food.imageUrl && (
              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-full rounded-2xl object-cover max-h-[420px]"
              />
            )}

            <div className="grid gap-2 text-[var(--text)] mt-10">
              <p><span className='font-medium'>Quantity</span> : {food.quantity || '—'}</p>
              <p><span className='font-medium'>Pickup Location</span> : {food.pickupLocation || '—'}</p>
              <p>
                <span className='font-medium'>Expire Date</span> :{' '}
                {food.expireDate
                  ? new Date(food.expireDate).toLocaleDateString()
                  : '—'}
              </p>
              <p>
                <span className='font-medium'>Notes</span> : {food.notes || 'N/A'}</p>
              <p><span className='font-medium'>Donor</span> : {food.donor?.name || food.donor?.email || '—'}</p>
            </div>

            {!isDonor && user && (
              <button
                disabled={!canRequest}
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-3 text-lg font-bold text-white disabled:opacity-60"
              >
                {canRequest ? 'Request Food' : 'Not Available'}
              </button>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
            onClick={() => {
              reset()
              setIsModalOpen(false)
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-5"
            >
              <h3 className="text-xl font-extrabold mb-3">Request Food</h3>
              <form
                onSubmit={handleSubmit(v => requestMutation.mutate(v))}
                className="grid gap-3"
              >
                <input
                  {...register('location', { required: true })}
                  placeholder="Location"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                />
                <textarea
                  {...register('reason', { required: true })}
                  rows={3}
                  placeholder="Reason"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                />
                <input
                  {...register('contactNo', { required: true })}
                  placeholder="Contact No"
                  className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="flex-1 rounded-2xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-2 font-bold text-white"
                  >
                    {requestMutation.isPending ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      reset()
                      setIsModalOpen(false)
                    }}
                    className="flex-1 rounded-2xl border border-[var(--border)] px-4 py-2 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDonor && (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)] overflow-hidden">
            <div className="[background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff] p-4 font-extrabold">
              Requests
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">Requester</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Location</th>
                    <th className="p-3 text-left">Reason</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsQuery.data?.map(r => {
                    const st = (r.status || '').toLowerCase()
                    const disabled =
                      statusMutation.isPending ||
                      st === 'accepted' ||
                      st === 'rejected'

                    return (
                      <tr key={r._id} className="border-b">
                        <td className="p-3">{r.requesterName || '—'}</td>
                        <td className="p-3">{r.requesterEmail || '—'}</td>
                        <td className="p-3">{r.location || '—'}</td>
                        <td className="p-3">{r.reason || '—'}</td>
                        <td className="p-3">{r.contactNo || '—'}</td>
                        <td className="p-3">{r.status || 'pending'}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              disabled={disabled || st === 'accepted'}
                              onClick={() =>
                                statusMutation.mutate({
                                  requestId: r._id,
                                  status: 'accepted'
                                })
                              }
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-white disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              disabled={disabled || st === 'rejected'}
                              onClick={() =>
                                statusMutation.mutate({
                                  requestId: r._id,
                                  status: 'rejected'
                                })
                              }
                              className="rounded-xl bg-rose-600 px-3 py-2 text-white disabled:opacity-50"
                            >
                              Reject
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

export default FoodDetails
