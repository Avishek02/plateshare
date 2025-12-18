import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  const iconStyle = {
    width: 20,
    height: 20,
    filter: 'invert(1)',
    opacity: 0.85
  }

  return (
    <footer
      style={{
        marginTop: 40,
        padding: '28px 16px',
        background: '#000',
        color: '#fff'
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 20
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 20 }}>
          PlateShare
        </div>

        <div style={{ fontSize: 14, opacity: 0.8 }}>
          © {year} PlateShare — Empowering communities.
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 18,
            alignItems: 'center'
          }}
        >
          <a href='https://facebook.com' target='_blank' rel='noreferrer'>
            <img
              src='https://cdn-icons-png.flaticon.com/512/733/733547.png'
              alt='facebook'
              style={iconStyle}
            />
          </a>

          <a href='https://twitter.com' target='_blank' rel='noreferrer'>
            <img
              src='https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg'
              alt='x'
              style={iconStyle}
            />
          </a>

          <a href='https://instagram.com' target='_blank' rel='noreferrer'>
            <img
              src='https://cdn-icons-png.flaticon.com/512/2111/2111463.png'
              alt='instagram'
              style={iconStyle}
            />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
