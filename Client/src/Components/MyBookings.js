// src/components/MyBookings.js

import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('http://localhost:5000/api/my-appointments', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (!response.ok) throw new Error('Could not fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle Cancel Logic
  const handleCancel = async (bookingId, appointmentTime) => {
    // Frontend Check: Use '_seconds'
    const isPast = appointmentTime && new Date(appointmentTime._seconds * 1000) < new Date();
    if (isPast) {
      alert("You cannot cancel a past appointment.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken();

      const response = await fetch(`http://localhost:5000/api/appointment/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cancel.');
      }

      alert('Appointment canceled successfully.');
      fetchBookings(); // Refresh the list

    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ⭐️ CORRECTED HELPER FUNCTION ⭐️
  const formatTime = (timestamp) => {
    // Check for '_seconds' (with an underscore)
    if (!timestamp || !timestamp._seconds) {
      return "Date not set";
    }
    // Use '_seconds' to create the date
    return new Date(timestamp._seconds * 1000).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) return <p>Loading your appointments...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bookings-container">
      {bookings.length > 0 ? (
        bookings.map(booking => {
          // Logical Constraint Check (also needs '_seconds')
          const isPast = booking.appointmentTime && new Date(booking.appointmentTime._seconds * 1000) < new Date();

          return (
            <div key={booking.id} className="booking-card">
              
              <h4>{`Appointment with Dr. ${booking.doctorName || "Dr. [Name Placeholder]"}`}</h4>
              
              {/* This will now work */}
              <p><strong>Date:</strong> {formatTime(booking.appointmentTime)}</p>
              
              <p><strong>Reason:</strong> {booking.reason || "Not specified"}</p>
              
              <div className="booking-footer">
                <span className={`booking-status ${booking.status}`}>
                  {booking.status}
                </span>

                <button 
                  className="cancel-btn"
                  onClick={() => handleCancel(booking.id, booking.appointmentTime)}
                  disabled={isPast}
                  title={isPast ? "You cannot cancel a past appointment" : "Cancel appointment"}
                >
                  Cancel
                </button>
              </div>

            </div>
          );
        })
      ) : (
        <p>You have no appointments.</p>
      )}
    </div>
  );
};

export default MyBookings;