import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { success, error } from '../lib/toast'
import { useState } from 'react'

function AddFood() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm()
  const [submitting, setSubmitting] = useState(false)
  const email = user?.email || ''

  const onSubmit = async data => {
    try {
      setSubmitting(true)
      const body = {
        name: data.name,
        imageUrl: data.imageUrl,
        quantity: data.quantity,
        pickupLocation: data.pickupLocation,
        expireDate: data.expireDate,
        notes: data.notes || ''
      }
      await api.post('/foods', body)
      reset()
      success('Food added successfully.')
      navigate('/manage-foods')
    } catch {
      error('Failed to add food.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 500 }}>
      <h2>Add Food</h2>
      <p>Donor: {email}</p>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        <input placeholder='Food Name' {...register('name', { required: true })} />
        <input placeholder='Image URL' {...register('imageUrl', { required: true })} />
        <input placeholder='Quantity' {...register('quantity', { required: true })} />
        <input placeholder='Pickup Location' {...register('pickupLocation', { required: true })} />
        <input
          type="date"
          {...register('expireDate', { required: true })}
          min={new Date().toISOString().split('T')[0]}
        />
        <textarea placeholder='Notes' rows={3} {...register('notes')} />
        <button type='submit' disabled={submitting}>
          {submitting ? 'Adding...' : 'Add Food'}
        </button>
      </form>
    </div>
  )
}

export default AddFood
