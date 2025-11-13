import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '../lib/api'

function Home() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['featured-foods'],
    queryFn: async () => {
      const res = await api.get('/foods/featured')
      return res.data
    }
  })

  return (
    <div>
      <section
        style={{
          padding: '40px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          alignItems: 'flex-start'
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ fontSize: 32, fontWeight: 700 }}
        >
          Share surplus food, feed more people.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ maxWidth: 600, fontSize: 16, lineHeight: 1.5 }}
        >
          PlateShare connects donors with people in need. Reduce food waste and make an impact in your
          community with only a few simple steps.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <Link to='/foods'>
            <button>Browse Available Foods</button>
          </Link>
          <Link to='/add-food'>
            <button>Donate Food</button>
          </Link>
        </motion.div>
      </section>

      <section style={{ padding: '24px 16px' }}>
        <h2>Featured Foods</h2>
        {isLoading && <p>Loading featured foods...</p>}
        {isError && <p>Failed to load featured foods.</p>}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <p>No featured foods available right now.</p>
        )}
        {!isLoading && !isError && data && data.length > 0 && (
          <div
            style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16
            }}
          >
            {data.map(food => (
              <motion.div
                key={food._id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.15 }}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                {food.imageUrl && (
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6 }}
                  />
                )}
                <h3 style={{ margin: 0 }}>{food.name}</h3>
                <p style={{ margin: 0 }}>Quantity: {food.quantity}</p>
                <p style={{ margin: 0 }}>Pickup: {food.pickupLocation}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                  Expires: {new Date(food.expireDate).toLocaleDateString()}
                </p>
                <Link to={`/food/${food._id}`}>
                  <button style={{ marginTop: 8 }}>View Details</button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        {data && data.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Link to='/foods'>
              <button>Show All Foods</button>
            </Link>
          </div>
        )}
      </section>

      <section
        style={{
          padding: '24px 16px',
          background: '#f7f7f7',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h2>How PlateShare works</h2>
          <ol style={{ paddingLeft: 18 }}>
            <li>Create an account and sign in.</li>
            <li>Publish surplus food with clear details.</li>
            <li>Recipients request the food they need.</li>
            <li>Coordinate pickup and complete the donation.</li>
          </ol>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2>Why it matters</h2>
          <p>
            Every shared plate reduces waste and supports real people. PlateShare helps donors and
            recipients connect in a simple, transparent way.
          </p>
          <ul>
            <li>Reduce food waste</li>
            <li>Support vulnerable communities</li>
            <li>Build a culture of sharing</li>
          </ul>
        </motion.div>
      </section>

      <section style={{ padding: '24px 16px' }}>
        <h2>Community snapshot</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>150+</div>
            <div>Active donors</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.05 }}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>500+</div>
            <div>Successful requests</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.1 }}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 12
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>1k+</div>
            <div>Plates saved from waste</div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
