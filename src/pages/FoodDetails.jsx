import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useAuth } from '../auth/AuthProvider'

function FoodDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm()

  const {
    data: food,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['food', id],
    queryFn: async () => {
      const res = await api.get(`/foods/${id}`)
      return res.data
    }
  })

  const isDonor = user && food && food.donor && food.donor.email === user.email

  const {
    data: requests,
    isLoading: requestsLoading
  } = useQuery({
    queryKey: ['food-requests', id],
    enabled: !!id && !!user && isDonor,
    queryFn: async () => {
      const res = await api.get(`/requests/food/${id}`)
      return res.data
    }
  })

  const requestMutation = useMutation({
    mutationFn: async values => {
      setFeedback('')
      await api.post('/requests', { foodId: id, ...values })
    },
    onSuccess: () => {
      reset()
      setIsModalOpen(false)
      setFeedback('Request submitted successfully.')
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
    },
    onError: err => {
      const msg = err?.response?.data?.message || 'Request failed'
      setFeedback(msg)
    }
  })

  const statusMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      await api.patch(`/requests/${requestId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-requests', id] })
      queryClient.invalidateQueries({ queryKey: ['donor-requests'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['my-requests'] })
    }
  })

  const onSubmit = values => {
    requestMutation.mutate(values)
  }

  if (isLoading) return <div style={{ padding: 16 }}>Loading...</div>
  if (isError || !food) return <div style={{ padding: 16 }}>Error loading food</div>

  return (
    <div style={{ padding: 16 }}>
      <h2>{food.name}</h2>
      {food.imageUrl && (
        <img
          src={food.imageUrl}
          alt={food.name}
          style={{ maxWidth: 300, display: 'block', marginBottom: 12 }}
        />
      )}
      <p>Quantity: {food.quantity}</p>
      <p>Pickup Location: {food.pickupLocation}</p>
      <p>Expire Date: {new Date(food.expireDate).toLocaleDateString()}</p>
      <p>Status: {food.status}</p>
      <p>Notes: {food.notes || 'N/A'}</p>
      <p>Donor: {food.donor?.name || food.donor?.email}</p>

      {!isDonor && user && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setIsModalOpen(true)}>Request Food</button>
        </div>
      )}

      {feedback && (
        <div style={{ marginTop: 12 }}>
          {feedback}
        </div>
      )}

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ background: '#fff', padding: 16, maxWidth: 400, width: '100%' }}>
            <h3>Request Food</h3>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}
            >
              <input
                placeholder='Pickup location'
                {...register('location', { required: true })}
              />
              <textarea
                rows={3}
                placeholder='Why do you need this food?'
                {...register('reason', { required: true })}
              />
              <input
                placeholder='Contact number'
                {...register('contactNo', { required: true })}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type='submit' disabled={requestMutation.isPending}>
                  {requestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    reset()
                    setIsModalOpen(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDonor && (
        <div style={{ marginTop: 24 }}>
          <h3>Requests for this food</h3>
          {requestsLoading && <p>Loading requests...</p>}
          {!requestsLoading && (!requests || requests.length === 0) && <p>No requests yet.</p>}
          {!requestsLoading && requests && requests.length > 0 && (
            <table>
              <thead>
                <tr>
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
                {requests.map(r => (
                  <tr key={r._id}>
                    <td>{r.requesterName}</td>
                    <td>{r.requesterEmail}</td>
                    <td>{r.location}</td>
                    <td>{r.reason}</td>
                    <td>{r.contactNo}</td>
                    <td>{r.status}</td>
                    <td>
                      <button
                        disabled={
                          statusMutation.isPending ||
                          r.status === 'Accepted'
                        }
                        onClick={() =>
                          statusMutation.mutate({ requestId: r._id, status: 'Accepted' })
                        }
                      >
                        Accept
                      </button>{' '}
                      <button
                        disabled={
                          statusMutation.isPending ||
                          r.status === 'Rejected'
                        }
                        onClick={() =>
                          statusMutation.mutate({ requestId: r._id, status: 'Rejected' })
                        }
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default FoodDetails
