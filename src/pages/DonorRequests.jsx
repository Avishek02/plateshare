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

  const {
    data = [],
    isLoading,
    isError
  } = useQuery({
    queryKey: ['donor-requests', user?.email],
    enabled: !loading && !!user?.email,
    queryFn: async () => {
      const res = await api.get('/requests/donor')
      return Array.isArray(res.data) ? res.data : []
    },
    retry: 1
  })

  useEffect(() => {
    if (isError) error('Failed to load donation requests.')
  }, [isError])

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, foodId }) => {
      await api.patch(`/requests/${id}/status`, { status })
      if (status === 'Accepted' && foodId) {
        await api.patch(`/foods/${foodId}`, { status: 'donated' })
      }
    },

    onSuccess: () => {
      success('Request status updated.')
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
    },
    onError: () => {
      error('Failed to update request status.')
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

  if (!data || data.length === 0) {
    return (
      <div className="px-4 py-6">
        <h2 className="text-2xl font-semibold">Donation Requests</h2>
        <p className="mt-2 text-gray-600">You have no incoming requests.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-semibold">Donation Requests</h2>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-medium">Food</th>
              <th className="px-4 py-3 font-medium">Requester</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map(r => {
              const st = (r.status || '').toLowerCase()
              const disabled =
                statusMutation.isPending ||
                st === 'accepted' ||
                st === 'rejected'

              return (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {r.food?._id ? (
                      <Link
                        to={`/food/${r.food._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {r.food?.name || 'View Food'}
                      </Link>
                    ) : (
                      <span className="text-gray-500">Food not available</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{r.requesterName || '—'}</td>
                  <td className="px-4 py-3">{r.requesterEmail || '—'}</td>
                  <td className="px-4 py-3">{r.location || '—'}</td>
                  <td className="px-4 py-3">{r.reason || '—'}</td>
                  <td className="px-4 py-3">{r.contactNo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {r.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    <button
                      className="rounded bg-green-600 px-3 py-1 text-white disabled:opacity-50"
                      disabled={disabled || st === 'accepted'}
                      onClick={() => handleStatus(r, 'Accepted')}
                    >
                      Accept
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
                      disabled={disabled || st === 'rejected'}
                      onClick={() => handleStatus(r, 'Rejected')}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DonorRequests
