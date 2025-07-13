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
  const {login} = useAuth();

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
        toast.success('Login successfull');
        login(result.user)
        navigate('/');
      } else {
        toast.error(result.message || 'Invalid credentials', {icon : '🚫'});
       setErrorMsg(result.message || 'Invalid credentials');
      }
    } catch (error) {
        toast.error('Unable to connect to server');
     // setErrorMsg('Unable to connect to server.'+error);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ width: '370px' }} />
        </div>
        <h4 className="text-center mb-3 text-prime fw-bold">Sign into your account</h4>

        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {errorMsg}
            <button type="button" className="btn-close" onClick={() => setErrorMsg('')} aria-label="Close"></button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-medium">Username</label>
            <div className="input-group">
              <input
                type="text"
                id="username"
                className="form-control"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="input-group-text">
                <i className="fa fa-user text-muted"></i>
              </span>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="userpass" className="form-label fw-medium">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="userpass"
                className="form-control"
                required
                placeholder="********"
                value={userpass}
                onChange={(e) => setUserpass(e.target.value)}
              />
              <span
                className="input-group-text"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className="fa fa-eye"></i>
              </span>
            </div>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-prime btn-block fw-semibold">
              Login
            </button>
          </div>

          <div className="text-center">
            <a href="/reset_password" className="text-decoration-none text-secondary">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
