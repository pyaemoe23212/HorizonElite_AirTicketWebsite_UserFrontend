import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-sky-200/70 bg-sky-100/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-base font-extrabold text-blue-950"
            aria-label="Horizon Elite home"
          >
            <svg
              className="h-7 w-7 text-blue-900"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 3.25c.9 0 1.65.72 1.65 1.61v5.22l6.39 3.77c.42.25.68.7.68 1.19v1.09c0 .45-.43.77-.86.65l-6.21-1.78v3.38l2.05 1.54c.27.2.43.52.43.86v.64c0 .39-.37.68-.75.58L12 21.1 8.62 22c-.38.1-.75-.19-.75-.58v-.64c0-.34.16-.66.43-.86l2.05-1.54V15l-6.21 1.78c-.43.12-.86-.2-.86-.65v-1.09c0-.49.26-.94.68-1.19l6.39-3.77V4.86c0-.89.75-1.61 1.65-1.61Z"
                fill="currentColor"
              />
            </svg>
            Horizon Elite
          </Link>

          <div className="hidden items-center gap-9 text-sm font-semibold text-slate-800 lg:flex">
            <Link to="/flights/search" className="transition hover:text-blue-700">
              Flight Status
            </Link>
            <Link to="/flights/search" className="transition hover:text-blue-700">
              Manage Booking
            </Link>
            <Link to="/flights/search" className="transition hover:text-blue-700">
              Check-in
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5 text-sm font-semibold text-slate-800">
          <button className="hidden items-center gap-1 transition hover:text-blue-700 sm:flex">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3.6 9h16.8M3.6 15h16.8M12 3c2 2.18 3 5.18 3 9s-1 6.82-3 9M12 3c-2 2.18-3 5.18-3 9s1 6.82 3 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            EN
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="hidden transition hover:text-blue-700 sm:inline">Help</button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-50 transition hover:border-blue-400"
                aria-label="Profile menu"
              >
                <svg className="h-5 w-5 text-blue-950" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-blue-200 bg-white shadow-lg">
                  <div className="px-4 py-3 border-b border-blue-100">
                    <p className="text-sm font-semibold text-gray-800">{user.email_address}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="flex h-10 items-center gap-2 rounded-xl border border-blue-200 px-4 font-semibold text-blue-950 transition hover:border-blue-400 hover:bg-white"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
