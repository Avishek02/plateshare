import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import api from '../lib/api'
import { Link } from 'react-router-dom'

function ManageFoods() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const email = user?.email

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-foods', email],
    enabled: !!email,
    queryFn: async () => {
      const res = await api.get('/foods')
      return res.data.filter(item => item.donor?.email === email)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async id => {
      await api.delete(`/foods/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-foods', email] })
    }
  })

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading foods</div>

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Manage My Foods</h2>
        <p>You have no foods yet.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Manage My Foods</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Pickup</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.pickupLocation}</td>
              <td>{item.status}</td>
              <td>
                <Link to={`/food/${item._id}`}>View</Link>{' '}
                <button
                  onClick={() => {
                    const ok = window.confirm('Delete this food?')
                    if (ok) deleteMutation.mutate(item._id)
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ManageFoods
