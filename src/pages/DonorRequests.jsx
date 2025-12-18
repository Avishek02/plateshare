import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { success, error } from '../lib/toast'
import { useAuth } from '../auth/AuthProvider'

function DonorRequests() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['donor-requests', user?.email],
    enabled: !loading && !!user,
    queryFn: async () => {
      const res = await api.get('/requests/donor')
      return res.data
    },
    onError: () => {
      error('Failed to load donation requests.')
    }
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/requests/${id}/status`, { status })
    },
    onSuccess: () => {
      success('Request status updated.')
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
    onError: () => {
      error('Failed to update request status.')
    }
  })

  const handleStatus = (id, status) => {
    statusMutation.mutate({ id, status })
  }

  if (loading || isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (!user) return <div style={{ padding: 16 }}>Please login.</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading requests</div>

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Donation Requests</h2>
        <p>You have no incoming requests.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Donation Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Food</th>
            <th>Requester</th>
            <th>Email</th>
            <th>Location</th>
            <th>Reason</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r._id}>
              <td>
                {r.food ? (
                  <Link to={`/food/${r.food._id}`}>{r.food.name}</Link>
                ) : (
                  'Food not available'
                )}
              </td>
              <td>{r.requesterName}</td>
              <td>{r.requesterEmail}</td>
              <td>{r.location}</td>
              <td>{r.reason}</td>
              <td>{r.contactNo}</td>
              <td>{r.status}</td>
              <td>
                <button
                  disabled={statusMutation.isPending || r.status === 'Accepted'}
                  onClick={() => handleStatus(r._id, 'Accepted')}
                >
                  Accept
                </button>{' '}
                <button
                  disabled={statusMutation.isPending || r.status === 'Rejected'}
                  onClick={() => handleStatus(r._id, 'Rejected')}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DonorRequests
