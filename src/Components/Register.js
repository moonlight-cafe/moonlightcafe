import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef } from 'react';
import './Register.css';

const Method = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;
const navcafeimg = Config.moonlightcafelogo

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    number: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [cnfshowPassword, setcnfShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: '', type: '', visible: false });
  const popupTimer = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showPopup = (message, type = 'success') => {
    Method.showPopup(setPopup, popupTimer, message, type, 5000);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showPopup('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await BackendAPIs.Register(formData.name, formData.email, formData.number, formData.password, formData.confirmPassword)

      if (response.status !== 200) {
        showPopup(response.message || 'Registration failed', 'error');
      } else {
        showPopup('Registration successful!', 'success');
        setFormData({
          name: '',
          email: '',
          mobile: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      showPopup('Something went wrong. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="common-box-comtainer">
      <div className="common-box">
        <img src={navcafeimg} alt="Moonlight Cafe" className="registration-logo" />

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="loginform-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="loginform-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="loginform-group">
            <input
              type="tel"
              name="number"
              placeholder="Mobile Number"
              value={formData.number}
              onChange={handleChange}
              pattern="[0-9]{10}"
              title="Please enter a 10-digit mobile number"
              required
            />
          </div>

          <div className="loginform-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <span
              className="material-symbols-outlined visibility-icon"
              onClick={() => setShowPassword((prev) => !prev)}
              style={{ cursor: "pointer", marginLeft: "10px", userSelect: "none" }}
            >
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </div>

          <div className="loginform-group password-group">
            <input
              type={cnfshowPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <span
              className="material-symbols-outlined visibility-icon"
              onClick={() => setcnfShowPassword((prev) => !prev)}
              style={{ cursor: "pointer", marginLeft: "10px", userSelect: "none" }}
            >
              {cnfshowPassword ? "visibility_off" : "visibility"}
            </span>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
      {Method.renderPopup(popup, () => Method.hidePopup(setPopup, popupTimer))}
    </div>
  );
};

export default RegistrationPage;
