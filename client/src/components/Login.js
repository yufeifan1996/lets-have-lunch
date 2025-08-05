import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../illustrations/logo.png';
import '../css/general.css';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    const user = { email, password };

    fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', 
      body: JSON.stringify(user),
    })
      .then((response) => {
        setLoading(false);
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.message || 'Something went wrong');
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
        
        // Mark the user as logged in in React state
        setIsAuthenticated(true);

        // Navigate to homepage 
        navigate('/');
      })
      .catch((error) => {
        setMessage(error.message);
      });
  };

  return (
    <div>
      <img src={logo} alt="Website Logo" className="website-logo-form" />
      <h2>Take a Break, Make a Bond</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>{message}</p>
      <p>
        Don’t have an account? <Link to="/register">Register Now</Link>
      </p>
    </div>
  );
};

export default Login;