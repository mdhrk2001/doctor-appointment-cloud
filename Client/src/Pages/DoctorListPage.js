// src/pages/DoctorListPage.js

import React, { useState, useMemo } from 'react';
import DoctorList from '../Components/DoctorList';

 // We will update this next

const DoctorListPage = ({ doctors, loadingDoctors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const specialties = useMemo(() => { 
    return [...new Set(doctors.map(doc => doc.speciality))];
  }, [doctors]);

  const filteredDoctors = doctors.filter(doctor => {
    const specialtyMatch = selectedSpecialty === '' || doctor.speciality === selectedSpecialty;
    const searchMatch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    return specialtyMatch && searchMatch;
  });

  // All modal and map state has been removed!

  return (
    <div className="container">
      <h2>Find Your Doctor</h2>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by doctor's name..."
          className="filter-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          <option value="">All Specialties</option>
          {specialties.map(speciality => (
            <option key={speciality} value={speciality}>
              {speciality}
            </option>
          ))}
        </select>
      </div>

      {loadingDoctors ? (
        <p>Loading doctors...</p>
      ) : (
        <>
          {/* We now pass the filtered list to the updated DoctorList */}
          <DoctorList doctors={filteredDoctors} />
          
          {filteredDoctors.length === 0 && (
            <p style={{marginTop: '20px'}}>No doctors match your criteria.</p>
          )}
        </>
      )}
      
      {/* The BookingModal has been removed from this page */}
    </div>
  );
};

export default DoctorListPage;