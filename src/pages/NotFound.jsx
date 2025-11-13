import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        textAlign: 'center'
      }}
    >
      <img
        src='https://i.ibb.co/F6Bqh6d/404-food.png'
        alt='Page not found'
        style={{ maxWidth: '320px', width: '100%', marginBottom: '16px' }}
      />
      <h2>Page not found</h2>
      <p>The page you are looking for does not exist or may have been moved.</p>
      <Link to='/'>
        <button style={{ marginTop: 12 }}>Back to Home</button>
      </Link>
    </div>
  )
}

export default NotFound
