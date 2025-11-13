import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        marginTop: 32,
        padding: '16px',
        borderTop: '1px solid #ddd',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center'
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 18 }}>PlateShare</div>
      <div style={{ fontSize: 12, color: '#666' }}>
        © {year} PlateShare. All rights reserved.
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 14 }}>
        <a href='https://facebook.com' target='_blank' rel='noreferrer'>
          Facebook
        </a>
        <a href='https://twitter.com' target='_blank' rel='noreferrer'>
          Twitter
        </a>
        <a href='https://instagram.com' target='_blank' rel='noreferrer'>
          Instagram
        </a>
      </div>
    </footer>
  )
}

export default Footer
