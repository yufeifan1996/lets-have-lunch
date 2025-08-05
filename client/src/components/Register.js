import React, { useState } from 'react';
import '../css/general.css';
import { Link } from 'react-router-dom'; 
import logo from '../illustrations/logo.png';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = (e) => {
        e.preventDefault();
        setLoading(true);
        const newUser = { username, email, password };

        fetch('http://127.0.0.1:5000/api/register', {
            method: 'post',
            headers:{
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
            body: JSON.stringify(newUser),
        })
        .then(response => {
            setLoading(false);
            if(!response.ok){
                return response.json().then(data => {
                    throw new Error(data.message || 'Opps, somthings went wrong');
                });
            }
            return response.json();
        })
        .then(data => {
            setMessage(data.message);
            setUsername('');
            setEmail('');
            setPassword('');
        })
        .catch(error => {
            setMessage(error.message);
        });
    };

    return(
        <div>
            <img src={logo} alt="Website Logo" className="website-logo-form" />
            <h2>Let’s Get Started, Together</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type= "email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type= "password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p></p>
            <p>{message}</p>
            <p>
                Already have an account? <Link to="/login">Login Now</Link>
            </p>
        </div>
    );
};

export default Register;

