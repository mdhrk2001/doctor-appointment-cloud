// src/pages/DoctorDetailsPage.js

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import useParams to read the URL
import MapComponent from '../Components/MapComponent';
import BookingModal from '../Components/bookingModal';

const DoctorDetailsPage = ({ doctors }) => {
  // 1. Get the 'id' from the URL (e.g., /doctor/THIS_ID)
  const { id } = useParams();

  // 2. Find the correct doctor from the full list
  const doctor = doctors.find(d => d.id === id);

  // 3. Manage the booking modal state (moved from DoctorListPage)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleBookingSuccess = (doctorName) => {
    handleCloseModal();
    alert(`Booking successful with ${doctorName}!`);
  };
  
  // Handle case where doctor isn't found
  if (!doctor) {
    return (
      <div className="container">
        <h2>Doctor not found</h2>
        <Link to="/doctors" className="cta-button">Back to list</Link>
      </div>
    );
  }

  // 4. If doctor is found, render their details
  return (
    <div className="container">
      <Link to="/doctors" className="back-link">&larr; Back to all doctors</Link>
      
      <div className="doctor-details-header">
        <h1>{`Dr. ${doctor.name}`}</h1>
        <p className="doctor-specialty">{doctor.specialty}</p>
      </div>

      <div className="doctor-details-layout">
        <div className="doctor-details-info">
          <h3>Doctor's Bio</h3>
          <p>{doctor.bio || "No biography available."}</p>
          
          <h3>Practice Location</h3>
          <p>{doctor.address || "No address provided."}</p>

          <button className="cta-button" onClick={handleOpenModal}>
            Book Appointment
          </button>
        </div>

        <div className="doctor-details-map">
          {/* We will update the MapComponent next */}
          <MapComponent doctor={doctor} />
        </div>
      </div>

      {/* 5. Render the modal (same as before) */}
      {isModalOpen && (
        <BookingModal 
          doctor={doctor}
          onClose={handleCloseModal}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default DoctorDetailsPage;