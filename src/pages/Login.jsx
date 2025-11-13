import { useForm } from 'react-hook-form'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

function Login() {
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const onSubmit = async data => {
    try {
      setError('')
      await signInWithEmailAndPassword(auth, data.email, data.password)
      navigate(from, { replace: true })
    } catch {
      setError('Login failed')
    }
  }

  const handleGoogle = async () => {
    try {
      setError('')
      await signInWithPopup(auth, googleProvider)
      navigate(from, { replace: true })
    } catch {
      setError('Google login failed')
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 400 }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder='Email' type='email' {...register('email', { required: true })} />
        <input placeholder='Password' type='password' {...register('password', { required: true })} />
        <button type='submit'>Login</button>
      </form>
      <button onClick={handleGoogle} style={{ marginTop: 8 }}>Login with Google</button>
      <p style={{ marginTop: 8 }}>
        New here? <Link to='/register'>Register</Link>
      </p>
    </div>
  )
}

export default Login
