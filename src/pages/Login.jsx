import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/callcalendar-logo.png';
import { toast } from 'react-hot-toast';
import { useAuth } from '../utils/idb';

function Login() {
  const [username, setUsername] = useState('');
  const [userpass, setUserpass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userpass }),
      });

      const result = await response.json();
      if (result.status) {
        toast.success('Login successful');
        login(result.user);
        navigate('/');
      } else {
        toast.error(result.message || 'Invalid credentials', { icon: '🚫' });
        setErrorMsg(result.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Unable to connect to server');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="mx-auto w-72" />
        </div>
        <h2 className="text-xl font-bold text-center prime-text mb-4">
          Sign into your account
        </h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded relative mb-4">
            <strong className="font-semibold">Error:</strong> {errorMsg}
            <button
              onClick={() => setErrorMsg('')}
              className="absolute right-2 top-2 text-red-500 hover:text-red-700"
            >
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="absolute right-3 top-2.5 text-gray-400">
                <i className="fa fa-user"></i>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="userpass" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="userpass"
                required
                placeholder="********"
                value={userpass}
                onChange={(e) => setUserpass(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div
                className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className="fa fa-eye"></i>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              className="w-full btn-prime font-semibold py-2 px-4 rounded-md "
            >
              Login
            </button>
          </div>

          <div className="text-center">
            <a href="/reset_password" className="text-sm text-gray-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
