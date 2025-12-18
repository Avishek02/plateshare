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
      <section className='section hero'>
        <div className='container'>
          <div className='hero-grid'>
            <div>
              <motion.h1
                className='hero-title'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                Turn surplus into support with{' '}
                <span className='hero-highlight'>PlateShare</span>.
              </motion.h1>
              <motion.p
                className='hero-subtitle'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Share extra food with your community instead of wasting it. Publish donations in minutes
                and let people in need request what they truly need.
              </motion.p>
              <motion.div
                className='hero-actions'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                <Link to='/foods'>
                  <button className='btn btn-primary'>View All Foods</button>
                </Link>
                <Link to='/add-food'>
                  <button className='btn btn-secondary'>Donate Food</button>
                </Link>
              </motion.div>
              <div className='hero-meta'>
                <div className='hero-pill'>No wasted food.</div>
                <div className='hero-pill'>Secure, request-based sharing.</div>
              </div>
            </div>
            <motion.div
              className='hero-card'
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className='section-subtitle'>Live snapshot</div>
              <div className='grid grid-cols-responsive' style={{ gap: 12 }}>
                <div>
                  <div className='card-meta'>Donations today</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>24</div>
                </div>
                <div>
                  <div className='card-meta'>Plates saved</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>120+</div>
                </div>
                <div>
                  <div className='card-meta'>Active donors</div>
                  <div style={{ fontSize: 26, fontWeight: 700 }}>65</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className='section'>
        <div className='container'>
          <div className='section-header'>
            <div>
              <div className='section-title'>Featured foods</div>
              <div className='section-subtitle'>
              </div>
            </div>
          </div>

          {isLoading && <p className='section-subtitle'>Loading featured foods...</p>}
          {isError && <p className='section-subtitle'>Failed to load featured foods.</p>}
          {!isLoading && !isError && (!data || data.length === 0) && (
            <p className='section-subtitle'>No featured foods available right now.</p>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <>
              <div className='grid grid-cols-responsive'>
                {data.map(food => (
                  <motion.div
                    key={food._id}
                    className='card'
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                  >
                    {food.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className='card-image'
                      />
                    )}
                    <div className='card-header'>
                      <span className='badge-status'>Available</span>
                      <span>{food.quantity}</span>
                    </div>
                    <div className='card-title'>{food.name}</div>
                    <div className='card-meta'>
                      Pickup: {food.pickupLocation}
                      <br />
                      Expires: {new Date(food.expireDate).toLocaleDateString()}
                    </div>
                    <Link to={`/food/${food._id}`}>
                      <button className='btn btn-secondary' style={{ marginTop: 8 }}>
                        View Details
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <Link to='/foods'>
                  <button className='btn btn-primary'>Show All Foods</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className='section'>
        <div className='container grid grid-cols-responsive'>
          <div>
            <div className='section-title'>How PlateShare works</div>
            <ol className='card-meta' style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Sign in and publish your surplus food.</li>
              <li>Recipients browse and request what they need.</li>
              <li>Coordinate pickup and complete the donation.</li>
            </ol>
          </div>
          <div>
            <div className='section-title'>Why it matters</div>
            <p className='card-meta' style={{ marginBottom: 8 }}>
              Every shared plate reduces waste, supports people and strengthens your local community.
            </p>
            <ul className='card-meta' style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Reduce avoidable food waste.</li>
              <li>Connect donors with real needs.</li>
              <li>Make sharing part of daily life.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
