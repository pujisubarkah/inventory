// src/components/LoginModal.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust the path if needed

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Untuk menangani kesalahan login

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Error logging in with Google:', error.message);
      setError('Failed to login with Google');
    }
  };

  const signInWithEmail = async () => {
    // Reset error sebelum mencoba login
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error logging in with email and password:', error.message);
      setError('Invalid email or password');
    } else {
      console.log('Logged in successfully:', data);
      // Redirect to dashboard atau halaman lain setelah login berhasil
      window.location.href = '/dashboard'; // Contoh redirect
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Cegah form agar tidak refresh halaman
    signInWithEmail();  // Panggil fungsi sign-in
  };

  if (!isOpen) return null; // Jika modal tidak terbuka, kembalikan null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>

        {/* Tampilkan pesan kesalahan */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Input Email dan Password */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email/Username
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="masukkan email/username"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update state email
                required />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update state password
                required />
            </div>
          </div>

          {/* Tombol Login */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Masuk
            </button>
          </div>
        </form>

        {/* Tombol Google Login */}
        <div className="flex items-center justify-center mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-2 flex items-center justify-center bg-white border border-gray-300 text-gray-500 rounded-md shadow-sm hover:bg-gray-100"
          >
            <img
              src="/google.svg"
              alt="Google Logo"
              className="w-5 h-5 mr-2" />
            Google
          </button>
        </div>

        {/* Tombol Tutup Modal */}
        <button onClick={onClose} className="mt-4 text-gray-600">Close</button>
      </div>
    </div>
  );
};

export default LoginModal;
