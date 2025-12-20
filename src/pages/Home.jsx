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
    <div className="min-h-screen bg-[var(--bg-soft)]">
      <section className="px-4 py-14 [background:radial-gradient(900px_500px_at_15%_0%,rgba(34,197,94,.12),transparent_55%),radial-gradient(900px_500px_at_85%_0%,rgba(249,115,22,.12),transparent_55%),var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <motion.h1
              className="text-4xl font-extrabold text-[var(--text)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Turn surplus into support with{' '}
              <span className="text-[var(--accent)]">PlateShare</span>.
            </motion.h1>

            <motion.p
              className="mt-4 text-lg text-[var(--text-soft)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Share extra food with your community instead of wasting it. Publish donations in minutes
              and let people in need request what they truly need.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2 }}
            >
              <Link
                to="/foods"
                className="rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-6 py-3 font-bold text-white shadow-[0_14px_26px_rgba(22,163,74,.18)]"
              >
                View All Foods
              </Link>
              <Link
                to="/add-food"
                className="rounded-3xl border border-[var(--border)] bg-white px-6 py-3 font-bold text-[var(--text)] shadow-[0_10px_24px_rgba(2,6,23,.08)]"
              >
                Donate Food
              </Link>
            </motion.div>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-soft)]">
                No wasted food
              </span>
              <span className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--text-soft)]">
                Secure request-based sharing
              </span>
            </div>
          </div>

          <motion.div
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_40px_rgba(2,6,23,.10)]"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="mb-4 text-sm font-bold text-[var(--text-soft)]">
              Live snapshot
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-[var(--text-soft)]">Donations today</div>
                <div className="text-2xl font-extrabold">24</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-soft)]">Plates saved</div>
                <div className="text-2xl font-extrabold">120+</div>
              </div>
              <div>
                <div className="text-sm text-[var(--text-soft)]">Active donors</div>
                <div className="text-2xl font-extrabold">65</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-[var(--text)]">
                Featured foods
              </h2>
              <p className="mt-1 text-[var(--text-soft)]">
                Handpicked donations ready for pickup.
              </p>
            </div>
          </div>

          {isLoading && (
            <p className="text-[var(--text-soft)]">Loading featured foods...</p>
          )}

          {isError && (
            <p className="text-[var(--text-soft)]">Failed to load featured foods.</p>
          )}

          {!isLoading && !isError && (!data || data.length === 0) && (
            <p className="text-[var(--text-soft)]">No featured foods available right now.</p>
          )}

          {!isLoading && !isError && data && data.length > 0 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.map(food => (
                  <motion.div
                    key={food._id}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[0_14px_40px_rgba(2,6,23,.10)] transition"
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.15 }}
                  >
                    {food.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-48 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-full bg-[var(--pending-status-bg)] px-3 py-1 text-xs font-extrabold text-[var(--pending-status-text)]">
                          Available
                        </span>
                        <span className="text-sm font-semibold text-[var(--text-soft)]">
                          {food.quantity}
                        </span>
                      </div>

                      <h3 className="text-lg font-extrabold text-[var(--text)]">
                        {food.name}
                      </h3>

                      <div className="mt-2 text-sm text-[var(--text-soft)]">
                        Pickup: {food.pickupLocation}
                        <br />
                        Expires: {new Date(food.expireDate).toLocaleDateString()}
                      </div>

                      <Link
                        to={`/food/${food._id}`}
                        className="mt-4 inline-flex items-center justify-center rounded-3xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-bold text-[var(--text)] shadow-[0_10px_24px_rgba(2,6,23,.08)] transition hover:-translate-y-[1px]"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  to="/foods"
                  className="inline-flex items-center justify-center rounded-3xl bg-[linear-gradient(180deg,#22c55e,#16a34a)] px-6 py-3 font-bold text-white shadow-[0_14px_26px_rgba(22,163,74,.18)]"
                >
                  Show All Foods
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <div className="text-2xl font-extrabold text-[var(--text)]">
              How PlateShare works
            </div>
            <ol className="mt-3 grid gap-2 pl-5 text-[var(--text-soft)]">
              <li>Sign in and publish your surplus food.</li>
              <li>Recipients browse and request what they need.</li>
              <li>Coordinate pickup and complete the donation.</li>
            </ol>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_14px_40px_rgba(2,6,23,.10)]">
            <div className="text-2xl font-extrabold text-[var(--text)]">
              Why it matters
            </div>
            <p className="mt-3 text-[var(--text-soft)]">
              Every shared plate reduces waste, supports people and strengthens your local community.
            </p>
            <ul className="mt-3 grid gap-2 pl-5 text-[var(--text-soft)]">
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
