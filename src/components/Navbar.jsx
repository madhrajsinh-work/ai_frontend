import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react'; // make sure lucide-react is installed

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  return (
    <motion.nav
      className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-md fixed top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-xl font-bold text-blue-600">AI Chatbot</div>

      {user ? (
        <div className="relative flex items-center gap-3 cursor-pointer select-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <img
            src={`http://localhost:5000/${user.image}`}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700 hidden sm:block">{user.username}</span>
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </motion.div>
          </div>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute right-0 mt-24 bg-white border rounded shadow-md p-1 z-10 w-32"
            >
              <button
                onClick={handleLogout}
                className="block w-full text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="flex gap-4">
          <Link to="/signin" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition">
            Sign In
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
            Sign Up
          </Link>
        </div>
      )}
    </motion.nav>
  );
}
