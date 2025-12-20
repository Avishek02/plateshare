import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { success, error } from '../lib/feedback'
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
        status: 'Available',
        donor: {
          name: user?.displayName || '',
          email: user?.email || '',
          photoURL: user?.photoURL || ''
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
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_14px_40px_rgba(2,6,23,.10)]">
          <div className="p-5 border-b border-[var(--border)] mb-4 [background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff] rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <h2 className="text-3xl font-extrabold">Add Food</h2>

              <div className="inline-flex items-center gap-2 max-w-full rounded-full px-4 py-3 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
                <span className="inline-block size-2 rounded-full bg-[#f97316]" />
                <span className="truncate">Donor: {user?.email || ''}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 px-5 pb-6">
            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">Food details</div>

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Food Name"
                {...register('name', { required: true })}
              />

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Food Quantity (e.g. Serves 2 people)"
                {...register('quantity', { required: true })}
              />

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Pickup Location"
                {...register('pickupLocation', { required: true })}
              />

              <div className="grid gap-2">
                <div className="text-base font-extrabold text-[var(--text)]">Expire date</div>
                <input
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                  type="date"
                  {...register('expireDate', { required: true })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">Image</div>

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text-soft)]"
                type="file"
                accept="image/*"
                {...register('imageFile', { required: true })}
              />

              <input type="hidden" {...register('imageUrl')} />
            </div>

            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">Additional notes</div>

              <textarea
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Additional Notes"
                rows={4}
                {...register('notes')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || formState.isSubmitting}
              className="w-full rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-3 text-lg font-bold text-white shadow-[0_14px_26px_rgba(22,163,74,.18)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Food'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddFood
