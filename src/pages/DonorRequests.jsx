import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { Link } from 'react-router-dom'

function DonorRequests() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['donor-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/donor')
      return res.data
    }
  })

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/requests/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
    }
  })

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
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
            <th>Status</th>
            <th>Note</th>
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
              <td>{r.requesterName} ({r.requesterEmail})</td>
              <td>{r.status}</td>
              <td>{r.note || '-'}</td>
              <td>
                <button
                  disabled={statusMutation.isPending || r.status === 'Approved'}
                  onClick={() => statusMutation.mutate({ id: r._id, status: 'Approved' })}
                >
                  Approve
                </button>{' '}
                <button
                  disabled={statusMutation.isPending || r.status === 'Rejected'}
                  onClick={() => statusMutation.mutate({ id: r._id, status: 'Rejected' })}
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
