import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { useState } from 'react'
import './navbar.css'

function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <nav className='nav'>
      <div className='nav-container'>
        <Link to='/' className='nav-logo'>
          PlateShare
        </Link>

        <div className='nav-links'>
          <Link to='/'>Home</Link>
          <Link to='/foods'>Foods</Link>

          {user && (
            <>
              <Link to='/add-food'>Add Food</Link>
              <Link to='/manage-foods'>My Foods</Link>
              <Link to='/my-requests'>My Requests</Link>
              <Link to='/donor-requests'>Donation Requests</Link>
              <button className='logout-btn' onClick={logout}>Logout</button>
            </>
          )}

          {!user && (
            <Link className='login-btn' to='/login'>Login</Link>
          )}
        </div>

        <button className='hamburger' onClick={() => setOpen(!open)}>☰</button>

        <div className={`mobile-menu ${open ? 'show' : ''}`}>
          <Link to='/'>Home</Link>
          <Link to='/foods'>Foods</Link>

          {user && (
            <>
              <Link to='/add-food'>Add Food</Link>
              <Link to='/manage-foods'>My Foods</Link>
              <Link to='/my-requests'>My Requests</Link>
              <Link to='/donor-requests'>Donation Requests</Link>
              <button className='logout-btn' onClick={logout}>Logout</button>
            </>
          )}

          {!user && <Link to='/login' className='login-btn'>Login</Link>}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
