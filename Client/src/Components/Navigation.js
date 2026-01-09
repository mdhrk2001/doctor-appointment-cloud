// src/components/Navigation.js

import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";

const Navigation = ({ currentUser }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        DocApp
      </Link>
      <ul className="nav-menu">
        {currentUser ? (
          <>
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/doctors" className="nav-link">
                Find a Doctor
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/my-bookings" className="nav-link">
                My Appointments
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li className="nav-item">
            <Link to="/login" className="nav-link-button">
              Login
            </Link>
            <Link to="/signup" className="nav-link-button">
              Sign Up
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
