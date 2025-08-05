import React from 'react';
import { Outlet } from 'react-router-dom';
import '../css/general.css';
import illustration from '../illustrations/login.png';

const PublicPageWrapper = () => {
  return (
    <div className="container">
      {/* Left Section: Illustration */}
      <div className="left-section">
        <img src={illustration} alt="Illustration" className="illustration" />
        <div>
          Illustrations by <a href="https://undraw.co/" target="_blank" rel="noreferrer">unDraw</a>
        </div>
      </div>

      <div className="vl"></div>

      {/* Right Section: Dynamic Content */}
      <div className="right-section">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicPageWrapper;