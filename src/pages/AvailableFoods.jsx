import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import { Link } from 'react-router-dom'

function AvailableFoods() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['foods', 'Available'],
    queryFn: async () => {
      const res = await api.get('/foods', { params: { status: 'Available' } })
      return res.data
    }
  })

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading foods</div>

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Available Foods</h2>
        <p>No foods available.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Available Foods</h2>
      <ul>
        {data.map(item => (
          <li key={item._id} style={{ marginBottom: 8 }}>
            <strong>{item.name}</strong> – {item.quantity} – {item.pickupLocation}{' '}
            <Link to={`/food/${item._id}`}>View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AvailableFoods
