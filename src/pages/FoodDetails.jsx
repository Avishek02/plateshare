import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

function FoodDetails() {
  const { id } = useParams()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['food', id],
    queryFn: async () => {
      const res = await api.get(`/foods/${id}`)
      return res.data
    }
  })

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError) return <div style={{ padding: 16 }}>Error loading food</div>
  if (!data) return <div style={{ padding: 16 }}>Food not found</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>{data.name}</h2>
      <img src={data.imageUrl} alt={data.name} style={{ maxWidth: 300, display: 'block', marginBottom: 12 }} />
      <p>Quantity: {data.quantity}</p>
      <p>Pickup Location: {data.pickupLocation}</p>
      <p>Expire Date: {new Date(data.expireDate).toLocaleDateString()}</p>
      <p>Status: {data.status}</p>
      <p>Notes: {data.notes || 'N/A'}</p>
      <p>Donor: {data.donor?.name || data.donor?.email}</p>
    </div>
  )
}

export default FoodDetails
