import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/AuthProvider'
import api from '../lib/api'
import { confirmDelete } from '../lib/confirm'
import { success, error } from '../lib/toast'

function ManageFoods() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const email = user?.email

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['my-foods', email],
    enabled: !!email,
    queryFn: async () => {
      const res = await api.get(`/foods?email=${email}`)
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/foods/${id}`),
    onSuccess: () => {
      success('Food deleted successfully.')
      queryClient.invalidateQueries({ queryKey: ['my-foods', email] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
    },
    onError: () => {
      error('Failed to delete food.')
    }
  })

  const handleDelete = async id => {
    const ok = await confirmDelete()
    if (ok) deleteMutation.mutate(id)
  }

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading foods</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>Manage My Foods</h2>

      {data.length === 0 ? (
        <p>You have no foods yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Food</th>
              <th>Quantity</th>
              <th>Pickup</th>
              <th>Status</th>
              <th>Expire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.pickupLocation}</td>
                <td>{item.food_status}</td>
                <td>{new Date(item.expireDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/food/${item._id}`}>View</Link>{' '}
                  <Link to={`/update-food/${item._id}`}>Update</Link>{' '}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ManageFoods
