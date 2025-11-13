import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { error } from '../lib/toast'

function MyRequests() {
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await api.get('/requests/my')
      return res.data
    },
    onError: () => {
      error('Failed to load your requests.')
    }
  })

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading requests</div>

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>My Requests</h2>
        <p>You have not requested any food yet.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>My Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Food</th>
            <th>Donor</th>
            <th>Location</th>
            <th>Reason</th>
            <th>Contact</th>
            <th>Status</th>
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
              <td>{r.donorEmail}</td>
              <td>{r.location}</td>
              <td>{r.reason}</td>
              <td>{r.contactNo}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MyRequests
