import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Upload } from 'lucide-react';
import aiIllustration from '../assets/ai-illustration.png';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ username: '', phone: '', image: null, password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!form.phone.trim()) {
      setErrors({ ...errors, phone: 'Phone number is required to send OTP' });
      return;
    }

    try {
      setOtpLoading(true);
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('OTP sent via WhatsApp!');
      setOtpSent(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('OTP verified!');
      setIsVerified(true);
      setOtpSent(false);
      setOtp('');
      setErrors((prev) => ({ ...prev, phone: '' }));
    } catch (err) {
      alert(err.message);
    }
  };


  const validate = () => {
    const errs = {};
    const phoneRegex = /^\+91\d{10}$/;
    const usernameRegex = /^(?=.{3,}$)[a-z0-9_]*\.[a-z0-9_]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!form.username.trim()) errs.username = 'Username is required';
    else if (!usernameRegex.test(form.username.trim())) errs.username = 'Invalid username format';

    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!phoneRegex.test(form.phone.trim())) errs.phone = 'Invalid phone number';

    if (!form.image) errs.image = 'Profile image is required';

    if (!form.password) errs.password = 'Password is required';
    else if (!passwordRegex.test(form.password)) {
      errs.password = 'Use at least 6 characters including uppercase, lowercase, number, and special character';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (!isVerified) {
      setErrors({ ...errors, phone: 'Please verify your WhatsApp number before signing up.' });
      return;
    }

    if (Object.keys(validationErrors).length === 0) {
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('phone', form.phone);
      formData.append('image', form.image);
      formData.append('password', form.password);

      try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Signup failed');
        }

        alert('Signup successful!');
        setForm({ username: '', phone: '', image: null, password: '' });
        setIsVerified(false);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      <motion.div
        className="w-full md:w-1/2 h-64 md:h-screen bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden"
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

      <motion.div
        className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account? <Link to="/signin" className="text-blue-600 underline">Sign in</Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    const allowed = /^[a-z.]*$/;
                    if (allowed.test(value)) {
                      setForm({ ...form, username: value });
                      if (errors.username) setErrors({ ...errors, username: '' });
                    }
                  }}
                  placeholder="e.g. john.doe"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  maxLength={13}
                  onChange={(e) => {
                    const value = e.target.value;
                    const allowed = /^\+?[0-9]*$/;

                    if (allowed.test(value) && value.length <= 13) {
                      setForm({ ...form, phone: value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }
                  }}
                  placeholder="+91XXXXXXXXXX"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                {!otpSent && !isVerified && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-blue-600 flex items-center gap-2"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading && (
                      <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    )}
                    {otpLoading ? 'Sending OTP...' : 'Send OTP via WhatsApp'}
                  </button>
                )}

                {otpSent && !isVerified && (
                  <>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d{0,6}$/.test(value)) {
                            setOtp(value);
                          }
                        }}
                        placeholder="Enter the OTP"
                        className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-500"
                      />

                    </div>
                    <button
                      type="button"
                      className="mt-2 text-sm text-green-600 hover:underline"
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
                    </button>
                  </>
                )}

                {isVerified && (
                  <p className="text-green-600 text-sm mt-1">WhatsApp number verified</p>
                )}

              </div>

              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>

                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="profile-upload"
                    className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow cursor-pointer hover:bg-blue-700 transition"
                  >
                    <Upload className="mr-1" size={16} />
                    {form.image ? 'Change' : 'Upload'}
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.files[0] });
                      if (errors.image) setErrors({ ...errors, image: '' });
                    }}
                    className="hidden"
                  />

                  {form.image && (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="Preview"
                      className="w-9 h-9 object-cover rounded-full border"
                    />
                  )}
                </div>

                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <div
                  className="absolute right-3 top-8 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Register
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;