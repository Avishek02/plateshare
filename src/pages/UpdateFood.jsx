import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { success, error } from '../lib/feedback'
import Loading from '../components/Loading'
import ErrorState from '../components/ErrorState'

function UpdateFood() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const token = localStorage.getItem('token')

  const { register, handleSubmit, reset } = useForm()

  const {
    data: food,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['food', id],
    enabled: !!id && !!token,
    queryFn: async () => {
      const res = await api.get(`/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    },
    retry: 1
  })

  useEffect(() => {
    if (food) {
      reset({
        name: food.name || '',
        imageUrl: food.imageUrl || '',
        quantity: food.quantity || '',
        pickupLocation: food.pickupLocation || '',
        expireDate: food.expireDate ? food.expireDate.split('T')[0] : '',
        notes: food.notes || ''
      })
    }
  }, [food, reset])

  const mutation = useMutation({
    mutationFn: async values => {
      const body = {
        name: values.name,
        imageUrl: values.imageUrl,
        quantity: values.quantity,
        pickupLocation: values.pickupLocation,
        expireDate: values.expireDate,
        notes: values.notes || ''
      }

      await api.patch(`/foods/${id}`, body, {
        headers: { Authorization: `Bearer ${token}` }
      })
    },
    onSuccess: () => {
      success('Food updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['food', id] })
      queryClient.invalidateQueries({ queryKey: ['my-foods'] })
      queryClient.invalidateQueries({ queryKey: ['foods'] })
      queryClient.invalidateQueries({ queryKey: ['featured-foods'] })
      navigate('/manage-foods')
    },
    onError: () => {
      error('Failed to update food.')
    }
  })

  const onSubmit = values => {
    mutation.mutate(values)
  }

  if (isLoading) return <Loading />

  if (isError || !food) {
    return (
      <ErrorState
        title="Update Food"
        message="Something went wrong while loading food data."
      />
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_14px_40px_rgba(2,6,23,.10)]">
          <div className="p-5 border-b border-[var(--border)] mb-4 [background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff] rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <h2 className="text-3xl font-extrabold text-[var(--text)]">
                Update Food
              </h2>

              <div className="inline-flex items-center gap-2 max-w-full rounded-full px-4 py-3 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
                <span className="inline-block size-2 rounded-full bg-[#f97316]" />
                <span className="truncate">Edit details</span>
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
                placeholder="Image URL"
                {...register('imageUrl', { required: true })}
              />

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Quantity (e.g. Serves 2 people)"
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
                  type="date"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                  {...register('expireDate', { required: true })}
                />
              </div>

              <div className="grid gap-2">
                <div className="text-base font-extrabold text-[var(--text)]">Additional notes</div>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                  placeholder="Additional Notes"
                  {...register('notes')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !token}
              className="w-full rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-3 text-lg font-bold text-white shadow-[0_14px_26px_rgba(22,163,74,.18)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Updating...' : 'Update Food'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateFood
