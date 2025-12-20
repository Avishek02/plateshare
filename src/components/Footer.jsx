import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--card)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6">
        <div className="text-xl font-extrabold text-[var(--text)]">
          PlateShare
        </div>

        <div className="text-sm text-[var(--text-soft)]">
          © {year} PlateShare — Empowering communities.
        </div>

        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="grid place-items-center rounded-full border border-[var(--border)] bg-white p-2 shadow-[0_6px_16px_rgba(2,6,23,.08)] transition hover:-translate-y-[1px]"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
              alt="facebook"
              className="h-5 w-5"
            />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="grid place-items-center rounded-full border border-[var(--border)] bg-white p-2 shadow-[0_6px_16px_rgba(2,6,23,.08)] transition hover:-translate-y-[1px]"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/X_logo_2023_original.svg"
              alt="x"
              className="h-5 w-5"
            />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="grid place-items-center rounded-full border border-[var(--border)] bg-white p-2 shadow-[0_6px_16px_rgba(2,6,23,.08)] transition hover:-translate-y-[1px]"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="instagram"
              className="h-5 w-5"
            />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
