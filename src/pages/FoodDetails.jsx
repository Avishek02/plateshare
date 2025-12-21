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
      const res = await api.get(`/requests/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  const myFoodRequestQuery = useQuery({
    queryKey: ['my-food-request', id],
    enabled: !!id && !!token && !!user && !isDonor,
    queryFn: async () => {
      const res = await api.get('/requests/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const list = Array.isArray(res.data) ? res.data : []
      return (
        list.find(x => {
          const foodId = x?.food?._id || x?.food
          return String(foodId) === String(id)
        }) || null
      )
    },
    retry: 1
  })

  useEffect(() => {
    if (foodQuery.isError) error('Failed to load food details.')
  }, [foodQuery.isError])

  useEffect(() => {
    if (requestsQuery.isError) error('Failed to load requests.')
  }, [requestsQuery.isError])

  useEffect(() => {
    if (myFoodRequestQuery.isError) error('Failed to load your request status.')
  }, [myFoodRequestQuery.isError])

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
      queryClient.invalidateQueries({ queryKey: ['my-food-request', id] })
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
          `/foods/${id}`,
          { status: 'Donated' },
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
      queryClient.invalidateQueries({ queryKey: ['my-food-request', id] })
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

  const myReq = myFoodRequestQuery.data
  const myReqStatus = (myReq?.status || '').toLowerCase()

  const alreadyRequested = !!myReq
  const requestBtnText = alreadyRequested
    ? myReqStatus === 'pending'
      ? 'Request Pending'
      : myReqStatus === 'rejected'
        ? 'Request Rejected'
        : myReqStatus === 'accepted'
          ? 'Request Accepted'
          : 'Requested'
    : canRequest
      ? 'Request Food'
      : 'Not Available'

  const requestBtnDisabled =
    !canRequest ||
    (alreadyRequested && (myReqStatus === 'pending' || myReqStatus === 'rejected'))

  const requestBtnStyle =
    alreadyRequested && myReqStatus === 'rejected'
      ? {
          background: 'var(--rejected-status-bg)',
          color: 'var(--rejected-status-text)'
        }
      : alreadyRequested && myReqStatus === 'pending'
        ? {
            background: 'var(--pending-status-bg)',
            color: 'var(--pending-status-text)'
          }
        : {
            background: 'var(--primary)',
            color: 'var(--bg)'
          }

  const statusStyle = s => {
    const st = String(s || 'Pending').trim().toLowerCase()
    if (st === 'pending') {
      return {
        background: 'var(--pending-status-bg)',
        color: 'var(--pending-status-text)'
      }
    }
    if (st === 'rejected') {
      return {
        background: 'var(--rejected-status-bg)',
        color: 'var(--rejected-status-text)'
      }
    }
    if (st === 'accepted') {
      return {
        background: 'var(--accepted-status-bg)',
        color: 'var(--accepted-status-text)'
      }
    }
    return { background: 'var(--all-badge-bg)', color: 'var(--text)' }
  }

  return (
    <div className="px-4 py-8 md:pb-16 bg-[var(--bg-main-layout)]">
      <div className="mx-auto w-full max-w-3xl">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_14px_40px_rgba(2,6,23,.10)]">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-main-layout)] rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-extrabold text-[var(--primary)]">
                {food.name}
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold border border-[var(--all-badge-border)] bg-[var(--all-badge-bg)]">
                <span className="inline-block size-2 rounded-full bg-[var(--primary)]" />
                <span className="truncate text-[var(--primary)]">
                  {food.status}
                </span>
              </span>
            </div>
          </div>

          <div className="grid gap-5 pb-10">
            {food.imageUrl && (
              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-full object-cover max-h-[420px]"
              />
            )}

            <div className="grid gap-2 text-[var(--text)] px-5 mt-10">
              <p>
                <span className="font-medium">Quantity</span> :{' '}
                {food.quantity || '—'}
              </p>
              <p>
                <span className="font-medium">Pickup Location</span> :{' '}
                {food.pickupLocation || '—'}
              </p>
              <p>
                <span className="font-medium">Expire Date</span> :{' '}
                {food.expireDate
                  ? new Date(food.expireDate).toLocaleDateString()
                  : '—'}
              </p>
              <p>
                <span className="font-medium">Notes</span> :{' '}
                {food.notes || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Donor</span> :{' '}
                {food.donor?.name || food.donor?.email || '—'}
              </p>
            </div>

            {!isDonor && user && (
              <button
                disabled={requestBtnDisabled}
                style={requestBtnStyle}
                onClick={() => {
                  if (requestBtnDisabled) return
                  setIsModalOpen(true)
                }}
                className={`mx-5 rounded-3xl px-4 py-3 text-lg font-bold disabled:opacity-60 ${
                  requestBtnDisabled ? '!cursor-not-allowed' : '!cursor-pointer'
                }`}
              >
                {requestBtnText}
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
              <h3 className="text-xl font-extrabold mb-3 text-[var(--primary)]">
                Request Food
              </h3>
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
          <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)] overflow-hidden">
            <div className="bg-[var(--bg-main-layout)] p-4 font-extrabold text-[var(--primary)] text-xl">
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
                    const hideActions = st === 'accepted' || st === 'rejected'

                    return (
                      <tr key={r._id} className="border-b">
                        <td className="p-3">{r.requesterName || '—'}</td>
                        <td className="p-3">{r.requesterEmail || '—'}</td>
                        <td className="p-3">{r.location || '—'}</td>
                        <td className="p-3">{r.reason || '—'}</td>
                        <td className="p-3">{r.contactNo || '—'}</td>

                        <td className="p-3">
                          <span
                            style={statusStyle(r.status)}
                            className="inline-flex items-center rounded-full px-3 py-1 font-semibold capitalize text-xs border border-[var(--border)]"
                          >
                            {r.status || 'Pending'}
                          </span>
                        </td>

                        <td className="p-3">
                          {!hideActions && (
                            <div className="flex gap-2">
                              <button
                                disabled={disabled}
                                onClick={() =>
                                  statusMutation.mutate({
                                    requestId: r._id,
                                    status: 'accepted'
                                  })
                                }
                                className="rounded-2xl bg-[var(--accept-action-bg)] hover:bg-[var(--accept-action-hover)] text-[var(--accept-action-text)] px-3 py-1 text-xs font-bold disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                disabled={disabled}
                                onClick={() =>
                                  statusMutation.mutate({
                                    requestId: r._id,
                                    status: 'rejected'
                                  })
                                }
                                className="rounded-2xl bg-[var(--reject-action-bg)] hover:bg-[var(--reject-action-hover)] text-[var(--reject-action-text)] px-3 py-1 text-xs font-bold  disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
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
