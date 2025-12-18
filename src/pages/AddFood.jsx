import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { success, error } from '../lib/toast'
import { useState } from 'react'

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

function AddFood() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, reset, setValue, formState } = useForm()
  const [submitting, setSubmitting] = useState(false)

  const uploadToImgbb = async file => {
    if (!IMGBB_API_KEY) throw new Error('Missing IMGBB key')
    const form = new FormData()
    form.append('image', file)

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: form
    })

    const json = await res.json()
    if (!res.ok || !json?.success) throw new Error('Image upload failed')
    return json.data.url
  }

  const onSubmit = async data => {
    try {
      setSubmitting(true)

      if (!user?.email) {
        error('Please login first.')
        navigate('/login')
        return
      }

      const file = data.imageFile?.[0]
      if (!file) {
        error('Please select an image.')
        return
      }

      const imageUrl = await uploadToImgbb(file)
      setValue('imageUrl', imageUrl)

      const body = {
        name: data.name,
        imageUrl,
        quantity: data.quantity,
        pickupLocation: data.pickupLocation,
        expireDate: data.expireDate,
        notes: data.notes || '',
        food_status: 'Available',
        donator: {
          name: user?.displayName || '',
          email: user?.email || '',
          image: user?.photoURL || ''
        }
      }

      await api.post('/foods', body)

      reset()
      success('Food added successfully.')
      navigate('/manage-foods')
    } catch (e) {
      error(e?.message === 'Missing IMGBB key' ? 'Image hosting config missing.' : 'Failed to add food.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='addfood-page'>
      <div className='addfood-shell'>
        <div className='addfood-card'>
          <div className='addfood-header'>
            <h2 className='addfood-title'>Add Fooddfdskfdskfdsfsdf</h2>
            <div className='addfood-subrow'>
              <div className='addfood-subtitle'>Donation listing form</div>
              <div className='addfood-badge' title={user?.email || ''}>
                <span className='addfood-dot' />
                <span className='addfood-badgeText'>Donor: {user?.email || ''}</span>
              </div>
            </div>
          </div>

          <div className='addfood-body'>
            <form onSubmit={handleSubmit(onSubmit)} className='addfood-grid'>
              <div className='addfood-section'>
                <p className='addfood-sectionTitle'>Food details</p>
                <div className='addfood-field'>
                  <input className='addfood-control' placeholder='Food Name' {...register('name', { required: true })} />
                  <input
                    className='addfood-control'
                    placeholder='Food Quantity (e.g. Serves 2 people)'
                    {...register('quantity', { required: true })}
                  />
                  <input
                    className='addfood-control'
                    placeholder='Pickup Location'
                    {...register('pickupLocation', { required: true })}
                  />
                  <div>
                    <div className='addfood-label'>Expire date</div>
                    <input
                      className='addfood-control'
                      type='date'
                      {...register('expireDate', { required: true })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              <div className='addfood-section'>
                <p className='addfood-sectionTitle'>Image</p>
                <input
                  className='addfood-control'
                  type='file'
                  accept='image/*'
                  {...register('imageFile', { required: true })}
                />
                <input type='hidden' {...register('imageUrl')} />
              </div>

              <div className='addfood-section'>
                <p className='addfood-sectionTitle'>Additional notes</p>
                <textarea
                  className='addfood-control addfood-textarea'
                  placeholder='Additional Notes'
                  rows={4}
                  {...register('notes')}
                />
              </div>

              <div className='addfood-actions'>
                <button
                  type='submit'
                  disabled={submitting || formState.isSubmitting}
                  className='addfood-primaryBtn'
                >
                  {submitting ? 'Adding...' : 'Add Food'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AddFood
