import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="flex items-center justify-between px-4 py-2">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold">
          <img src={logo} alt="logo" className="h-32 w-auto mx-2" />
        </Link>

        {/* Menu */}
        <div className="flex gap-6 text-2xl font-avara italic">
          <Link to="/" className="text-gray-700 hover:text-black">
            Home
          </Link>

          <Link to="/watchlist" className="text-gray-700 hover:text-black">
            Watchlist
          </Link>

          <Link to="/lists" className="text-gray-700 hover:text-black">
            Lists
          </Link>

          <Link to="/search" className="text-gray-700 hover:text-black">
            Search
          </Link>
        </div>

        {/* Right side: avatar when logged in, Sign Up / Log In when not */}
        <div className="flex gap-3 mx-8 items-center">
          {user ? (
            <Link to="/profile">
              {user.avatarUrl ? (
                <img
                  src={`http://localhost:3011${user.avatarUrl}`}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover border border-gray-200 hover:ring-2 hover:ring-gray-400 transition"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 hover:ring-2 hover:ring-gray-400 transition">
                  {user.username?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </Link>
          ) : (
            <>
              <Link to="/signup" className="text-sm font-semibold text-gray-700">
                Sign Up
              </Link>
              <Link to="/login" className="text-sm font-semibold text-gray-700">
                Log In →
              </Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
