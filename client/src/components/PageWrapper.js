import React from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import Lobby from './Lobby';
import CreatePost from './CreatePost';
import MyInvitations from './MyInvitations';
import MyRSVP from './MyRSVP';
import Profile from './Profile';
import logo from '../illustrations/logo.png';
import '../css/pageWrapper.css';

import { FaHome, FaPlus, FaClipboardList, FaCheckCircle, FaUser, FaSignOutAlt } from 'react-icons/fa';

const PageWrapper = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      fetch('http://127.0.0.1:5000/api/logout', {
        method: 'GET',
        credentials: 'include',
      })
        .then(() => {
          navigate('/login'); 
        })
        .catch((error) => console.error('Error logging out:', error));
    };
  
    return (
        <div className="page-wrapper">
          <div className="main-content">
            <nav className="sidebar">
          <div className="logo-container">
          <NavLink to="/lobby">
            <img src={logo} alt="Website Logo" className="website-logo-form" />
          </NavLink>
          </div>

          {/* Navigation Links */}
          <ul>
            <li>
              <NavLink to="/lobby" activeClassName="active">
                <FaHome className="nav-icon" /> Lobby
              </NavLink>
            </li>
            <li>
              <NavLink to="/create-post" activeClassName="active">
                <FaPlus className="nav-icon" /> Create Post
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-posts" activeClassName="active">
                <FaClipboardList className="nav-icon" /> My Invitations
              </NavLink>
            </li>
            <li>
              <NavLink to="/my-rsvps" activeClassName="active">
                <FaCheckCircle className="nav-icon" /> My RSVP
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" activeClassName="active">
                <FaUser className="nav-icon" /> My Profile
              </NavLink>
            </li>
          </ul>

          <div className="logout-container">
            <div className="logout-link" onClick={handleLogout}>
              <FaSignOutAlt className="nav-icon" /> Logout
            </div>
          </div>
        </nav>
    
            {/* Dynamic Content */}
            <div className="content">
              <Routes>
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/my-posts" element={<MyInvitations />} />
                <Route path="/my-rsvps" element={<MyRSVP />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="*" element={<Lobby />} />
              </Routes>
            </div>
          </div>
            {/* Footer */}
            <footer className="footer">
                <p>© 2024 yufeifan's CS50 Final Project. All Rights Reserved.</p>
            </footer>
        </div>
      );
    };
    
export default PageWrapper;