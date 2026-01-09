// src/App.js

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

// Import Pages
import HomePage from "./Pages/Home";
import LoginPage from "./Pages/Loginpage";
import SignupPage from "./Pages/Signuppage";
import DoctorListPage from "./Pages/DoctorListPage";
import MyBookingsPage from "./Pages/MyBookingsPage";
import DoctorDetailsPage from "./Pages/DoctorDetailsPage";
// Import Components
import Navigation from "./Components/Navigation";

import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true); // For auth check

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false); // Auth check is complete
    });
    return () => unsubscribe();
  }, []);

  // Fetch doctors (now happens once, here)
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const doctorsCollectionRef = collection(db, "doctors");
        const snapshot = await getDocs(doctorsCollectionRef);
        const doctorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors: ", error);
      }
      setLoadingDoctors(false);
    };

    fetchDoctors();
  }, []); // Fetches doctors on app load

  // Show a loading spinner while checking auth
  if (loadingAuth) {
    return <div>Loading app...</div>;
  }

  return (
    <div className="App">
      {/* Navigation is now on every page */}
      <Navigation currentUser={currentUser} />

      {/* Routes define which page to show based on URL */}
      <Routes>
        <Route path="/" element={<HomePage currentUser={currentUser} />} />

        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" /> : <LoginPage />}
        />

        <Route path="/signup" element={<SignupPage />} />

        {/* RENAMED to DoctorListPage */}
        <Route
          path="/doctors"
          element={
            currentUser ? (
              <DoctorListPage
                doctors={doctors}
                loadingDoctors={loadingDoctors}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ⭐️ NEW: Doctor Details Page Route ⭐️ */}
        <Route
          path="/doctor/:id"
          element={
            currentUser ? (
              <DoctorDetailsPage doctors={doctors} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/my-bookings"
          element={currentUser ? <MyBookingsPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
