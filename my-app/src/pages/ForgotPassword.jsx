import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.warn('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${baseURL}/api/password/forgot`, { email });

      toast.success(
        'If this email exists, a reset link has been sent.',
        { autoClose: 3000 }
      );

      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer transition={Slide} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-emerald-700">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your registered email address
        </p>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p
          className="text-sm text-center mt-4 text-emerald-700 cursor-pointer"
          onClick={() => navigate('/')}
        >
          Back to login
        </p>
      </form>
    </div>
  );
}
