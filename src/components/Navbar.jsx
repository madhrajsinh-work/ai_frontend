import { motion } from "framer-motion";
import { Link } from 'react-router-dom';


export default function Navbar() {
 
  return (
    <motion.nav
      className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-md fixed top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-xl font-bold text-blue-600">AI Chatbot</div>
        <div className="flex gap-4">
          <Link to="/signin" className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition">
            Sign In
          </Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition">
            Sign Up
          </Link>
        </div>
  
    </motion.nav>
  );
}
