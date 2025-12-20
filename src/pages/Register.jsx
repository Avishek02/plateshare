import { useForm } from 'react-hook-form'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { success, error as toastError } from '../lib/feedback'
import api from '../lib/api'

function Register() {
  const { register, handleSubmit } = useForm()
  const [formError, setFormError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const uploadImage = async file => {
    const formData = new FormData()
    formData.append('image', file)

    const res = await api.post(
      `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
      formData
    )
    return res.data.data.url
  }

  const onSubmit = async data => {
    try {
      setFormError('')
      const password = data.password || ''

      if (!/[A-Z]/.test(password)) {
        setFormError('Password must have an Uppercase letter.')
        return
      }
      if (!/[a-z]/.test(password)) {
        setFormError('Password must have a Lowercase letter.')
        return
      }
      if (password.length < 6) {
        setFormError('Password length must be at least 6 characters.')
        return
      }

      let photoURL = ''
      if (data.photo?.[0]) {
        photoURL = await uploadImage(data.photo[0])
      }

      const cred = await createUserWithEmailAndPassword(auth, data.email, password)

      await updateProfile(cred.user, {
        displayName: data.name,
        photoURL
      })

      success('Registration successful.')
      navigate('/')
    } catch {
      setFormError('Register failed.')
      toastError('Register failed.')
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      success('Login successful.')
      navigate('/')
    } catch {
      toastError('Google login failed.')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--bg-soft)] [background:radial-gradient(900px_500px_at_15%_0%,rgba(22,163,74,.10),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.10),transparent_55%),var(--bg-soft)]">
      <div className="mx-auto w-full max-w-xl">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-[0_14px_40px_rgba(2,6,23,.10)]">
          <div className="p-5 border-b border-[var(--border)] mb-4 [background:radial-gradient(600px_240px_at_10%_0%,rgba(34,197,94,.10),transparent_60%),radial-gradient(600px_240px_at_90%_0%,rgba(249,115,22,.10),transparent_60%),#ffffff] rounded-t-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <h2 className="text-3xl font-extrabold addfood-title">
                Register
              </h2>

              <div className="inline-flex items-center gap-2 max-w-full rounded-full px-4 py-3 font-semibold border border-[rgba(249,115,22,.22)] bg-[rgba(249,115,22,.12)] text-[#7c2d12]">
                <span className="inline-block size-2 rounded-full bg-[#f97316]" />
                <span className="truncate">Create account</span>
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-xl border border-[var(--danger)] bg-[rgba(239,68,68,0.1)] px-4 py-3 text-sm text-[var(--danger)]">
                {formError}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 px-5 pb-6">
            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">User details</div>

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Name"
                {...register('name', { required: true })}
              />

              <input
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="Email"
                type="email"
                {...register('email', { required: true })}
              />
            </div>

            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">Photo</div>

              <input
                type="file"
                accept="image/*"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[var(--text-soft)]"
                {...register('photo')}
              />
            </div>

            <div className="grid gap-3 p-4 rounded-2xl border border-[rgba(22,163,74,.14)] bg-[rgba(22,163,74,.06)]">
              <div className="text-base font-extrabold text-[var(--text)]">Security</div>

              <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--accent-soft)]">
                <input
                  className="w-full outline-none text-[var(--text)] placeholder:text-[var(--text-soft)]"
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-4 py-3 text-lg font-bold text-white shadow-[0_14px_26px_rgba(22,163,74,.18)]"
            >
              Register
            </button>



            <button
              onClick={handleGoogle}
              type="button"
              className="group relative w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-white px-4 py-3 font-bold text-[var(--text)] shadow-[0_10px_24px_rgba(2,6,23,.08)] transition hover:-translate-y-[1px] hover:shadow-[0_16px_34px_rgba(2,6,23,.12)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 [background:radial-gradient(500px_180px_at_15%_0%,rgba(59,130,246,.12),transparent_60%),radial-gradient(500px_180px_at_85%_0%,rgba(34,197,94,.10),transparent_60%)]" />

              <span className="relative flex items-center justify-center gap-3">
                <span className="grid place-items-center size-9 rounded-2xl border border-[rgba(2,6,23,.08)] bg-[rgba(2,6,23,.02)]">
                  <svg
                    viewBox="0 0 48 48"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.644 32.651 29.174 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.067 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.0 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.067 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.066 0 9.784-1.947 13.313-5.122l-6.141-5.196C29.11 35.255 26.715 36 24 36c-5.153 0-9.607-3.318-11.265-7.946l-6.52 5.025C9.533 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a11.95 11.95 0 0 1-4.131 5.682l.003-.002 6.141 5.196C36.879 39.245 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>

                </span>

                <span className="flex flex-col items-start leading-tight">
                  <span className="text-[15px] font-extrabold">Continue with Google</span>
                  <span className="text-xs font-semibold text-[var(--text-soft)]">
                    Fast and secure sign-in
                  </span>
                </span>
              </span>
            </button>




            <p className="text-center text-sm text-[var(--text-soft)]">
              Already have an account?{' '}
              <Link className="text-[var(--accent)] hover:underline" to="/login">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
