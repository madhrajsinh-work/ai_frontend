import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import aiIllustration from '../assets/ai-illustration.png';
import { Link } from 'react-router-dom';

const SignIn = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const trimmedIdentifier = identifier.trim();
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    const usernameRegex = /^(?=.{3,}$)[a-z0-9_]*\.[a-z0-9_]+$/;

    const isPhone = phoneRegex.test(trimmedIdentifier);
    const isUsername = usernameRegex.test(trimmedIdentifier);

    if (!trimmedIdentifier) {
        newErrors.identifier = 'This field is required';
    } else if (!isPhone && !isUsername) {
        newErrors.identifier = 'Enter a valid +91 phone number or username (e.g. john.doe)';
    }

    if (!password || password.trim() === '') {
        newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identifier: trimmedIdentifier,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Show backend error in UI
                setErrors({ identifier: data.message || 'Something went wrong' });
                return;
            }

            // Success: Save token and user info
            localStorage.setItem('token', data.token);

            // Redirect or reload
            console.log('Signed in successfully!', data);
            window.location.href = '/dashboard'; 

        } catch (error) {
            console.error('Sign-in error:', error);
            setErrors({ identifier: 'Server error. Try again later.' });
        }
    }
};


    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Left Side - Image (Hidden on mobile) */}
            <motion.div
                className="hidden md:block w-1/2 h-screen bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <img
                    src={aiIllustration}
                    alt="AI Illustration"
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Right Side - Sign In Form */}
            <motion.div
                className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Don’t have an account? <Link to="/signup" className="text-blue-600 underline">Register</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            {/* Identifier Field */}
                            <div>
                                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                    Phone number or Username
                                </label>
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="text"
                                    autoComplete="username"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        setErrors({ ...errors, identifier: '' });
                                    }}
                                    placeholder="Enter your phone or username"
                                    className={`appearance-none w-full px-4 py-2 border mt-2 rounded-md focus:outline-none focus:ring-2 ${errors.identifier
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-blue-500'
                                        }`}
                                />
                                {errors.identifier && (
                                    <p className="text-sm text-red-600 mt-1">{errors.identifier}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors({ ...errors, password: '' });
                                        }}
                                        placeholder="••••••••"
                                        className={`appearance-none w-full px-4 py-2 pr-10 mt-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password
                                            ? 'border-red-500 focus:ring-red-500'
                                            : 'border-gray-300 focus:ring-blue-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-5 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <span className="text-sm text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                        >
                            Sign In
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SignIn;
