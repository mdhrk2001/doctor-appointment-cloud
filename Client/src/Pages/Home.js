// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

// ⭐️ 1. Import your new background image
import HeroBg from '../assets/background.png'; 

const HomePage = ({ currentUser }) => {
  return (
    <div className="home-page">
      {/* ⭐️ 2. Apply the image using an inline style */}
      <div 
        className="hero-section-with-bg"
        style={{ backgroundImage: `url(${HeroBg})` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to DocApp</h1>
          <p>Book your doctor appointments online, anytime.</p>
          {currentUser ? (
            <Link to="/doctors" className="cta-button">Find a Doctor</Link>
          ) : (
            <Link to="/login" className="cta-button">Get Started</Link>
          )}
        </div>
      </div>

      <div className="container" style={{textAlign: 'center', padding: '40px 20px'}}>
        <h2>How It Works</h2>
        <p>1. Find a doctor. 2. Book a time. 3. Get confirmed.</p>
      </div>
    </div>
  );
};

export default HomePage;