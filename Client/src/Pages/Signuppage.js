// src/pages/LoginPage.js

import React from "react";
import Signup from "../Components/Signup";

const SignupPage = () => {
  return (
    <div className="auth-container signup-page">
      <div className="form-container">
        <Signup />
      </div>
    </div>
  );
};

export default SignupPage;
