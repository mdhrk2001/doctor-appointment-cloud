// src/components/BookingModal.js

import React, { useState } from 'react';
import { auth } from '../firebaseConfig';

const BookingModal = ({ doctor, onClose, onBookingSuccess }) => {
  // State for the form inputs
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  // Get today's date to prevent booking in the past
  const today = new Date().toISOString().split('T')[0];

  // ⭐️ DYNAMIC URL HELPER ⭐️
  // If we are on localhost, point to port 5000.
  // If we are on the Cloud VM (production), use an empty string to use the relative path
  // (assuming your Cloud setup routes '/api' correctly, or use the public IP with port 5000).
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : ''; 
    // NOTE: If your Cloud Nginx isn't set up to proxy /api, replace '' above with 'http://34.14.220.38:5000'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to book.');
      return;
    }

    try {
      const idToken = await user.getIdToken();
      
      // ⭐️ USE THE DYNAMIC BASE URL HERE ⭐️
      const response = await fetch(`${API_BASE_URL}/api/book-appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          doctorName: doctor.name, 
          appointmentDate: date,
          appointmentTime: time,
          reason: reason
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Booking failed');
      }

      // If successful, call the success function passed from the parent
      onBookingSuccess(doctor.name);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // Modal Overlay
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Content - stopPropagation prevents clicks inside from closing it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <h3>Book an Appointment with {doctor.name}</h3>
        <p>{doctor.specialty}</p>

        <form onSubmit={handleSubmit} className="booking-form">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today} // Prevent past dates
            required
          />

          <label htmlFor="time">Time:</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label htmlFor="reason">Reason for Visit: (Optional)</label>
          <textarea
            id="reason"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Annual checkup, consultation..."
          />

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="cta-button">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;