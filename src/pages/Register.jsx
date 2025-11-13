import { useForm } from 'react-hook-form'
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'

function Register() {
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async data => {
    try {
      setError('')
      const password = data.password
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || password.length < 6) {
        setError('Password must have upper, lower and min 6 chars')
        return
      }
      const cred = await createUserWithEmailAndPassword(auth, data.email, password)
      await updateProfile(cred.user, {
        displayName: data.name,
        photoURL: data.photoURL || ''
      })
      navigate('/')
    } catch {
      setError('Register failed')
    }
  }

  const handleGoogle = async () => {
    try {
      setError('')
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch {
      setError('Google register failed')
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 400 }}>
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input placeholder='Name' {...register('name', { required: true })} />
        <input placeholder='Photo URL' {...register('photoURL')} />
        <input placeholder='Email' type='email' {...register('email', { required: true })} />
        <input placeholder='Password' type='password' {...register('password', { required: true })} />
        <button type='submit'>Register</button>
      </form>
      <button onClick={handleGoogle} style={{ marginTop: 8 }}>Continue with Google</button>
      <p style={{ marginTop: 8 }}>
        Already have an account? <Link to='/login'>Login</Link>
      </p>
    </div>
  )
}

export default Register
