import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/illustration.jpg';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      // ✅ Redirect to dashboard after successful input
      navigate('/dashboard');
    } else {
      alert('Please enter both email and password');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side Image + Text */}
      <div className="w-1/2 bg-green-100 flex flex-col items-center justify-center p-10">
        <img src={illustration} alt="Illustration" className="w-3/4 mb-6 rounded" />
        <h2 className="text-2xl font-bold mb-2">Exam Mastery Hub</h2>
        <p className="text-center text-gray-600 max-w-md">
          Unleash Your Academic Success with Exam Mastery Hub’s Exam Excellence Platform.
        </p>
      </div>

      {/* Right Side Login */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-gray-600 mb-6">Welcome back! Log in to your account.</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <span
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-700 cursor-pointer text-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </span>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <a href="#" className="text-green-700 hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-3 rounded-md hover:bg-green-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="px-4 text-gray-500 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-md hover:bg-gray-50">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Sign in with Google
          </button>

          {/* Create Account */}
          <p className="text-center text-sm mt-6">
            Are you new?{' '}
            <a href="#" className="text-green-700 hover:underline">
              Create an Account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
