import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import leftImage from '../assets/left_image.jpg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    if (name && email && password && confirmPassword) {
      if (password === confirmPassword) {
        // ✅ Hook your backend registration logic here
        navigate('/dashboard');
      } else {
        alert('Passwords do not match');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  const loginAccount = () => {
    navigate('/');
  };

  const headingContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 },
    },
  };
  const letter = {
    hidden: { opacity: 0, y: `0.25em` },
    visible: {
      opacity: 1,
      y: `0em`,
      transition: { duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] },
    },
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden font-sans bg-gray-100">
      {/* ✅ LEFT SECTION: same as login page */}
      <div className="relative md:w-[55%] h-64 md:h-auto overflow-hidden rounded-br-[40px] rounded-tr-[40px]">
        <motion.img
          src={leftImage}
          alt="Decorative"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <motion.div
          className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md flex flex-wrap"
            variants={headingContainer}
            initial="hidden"
            animate="visible"
          >
            {'Welcome to TiVi'.split('').map((char, index) => (
              <motion.span key={index} variants={letter}>
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            className="max-w-md text-lg md:text-xl drop-shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Discover unique handmade tiles that transform your spaces with natural charm.
          </motion.p>
        </motion.div>
      </div>

      {/* ✅ RIGHT SECTION: polished Register form */}
      <div className="relative md:w-[45%] flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* Soft blurred blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-300 rounded-full filter blur-[160px] opacity-40 z-0"></div>
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-teal-300 rounded-full filter blur-[160px] opacity-30 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white opacity-20 z-0"></div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 70, damping: 12 }}
          className="w-full max-w-md p-8 md:p-10 bg-white rounded-2xl shadow-2xl relative z-10"
        >
          <h1 className="text-4xl font-bold mb-2 text-emerald-800">Sign Up</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Join us! Fill in your details to create an account.
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1 tracking-wide">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 tracking-wide">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold mb-1 tracking-wide">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-9 text-emerald-600 cursor-pointer text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 tracking-wide">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 text-white py-3 rounded-lg hover:bg-emerald-800 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-base mt-6 leading-relaxed">
            Already have an account?{' '}
            <a href="#" className="text-emerald-700 hover:underline" onClick={loginAccount}>
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
