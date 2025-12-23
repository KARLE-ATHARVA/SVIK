import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer, Slide } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_BASE_URL;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      toast.warn('Fill all fields');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${baseURL}/api/password/reset`, {
        token,
        newPassword: password
      });

      toast.success('Password reset successful');

      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(
        error.response?.data || 'Reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className="text-center mt-10">Invalid reset link</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer transition={Slide} />

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-emerald-700">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-700 text-white py-2 rounded-lg hover:bg-emerald-800 transition"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}