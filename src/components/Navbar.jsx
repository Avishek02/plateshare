import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'

function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12, alignItems: 'center' }}>
      <Link to='/'>PlateShare</Link>
      <Link to='/'>Home</Link>
      <Link to='/foods'>Available Foods</Link>
      {user && (
        <>
          <Link to='/add-food'>Add Food</Link>
          <Link to='/manage-foods'>Manage My Foods</Link>
        </>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {user ? (
          <>
            <span>{user.displayName || user.email}</span>
            <button onClick={signOut}>Logout</button>
          </>
        ) : (
          <>
            <Link to='/login'>Login</Link>
            <Link to='/register'>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
