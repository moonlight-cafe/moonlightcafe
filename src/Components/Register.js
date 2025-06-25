import React, { useState, useRef } from 'react';
import './Register.css';

import _Config from '../Config.js';
const Config = new _Config();
const backendurl = Config.backendurl
const navcafeimg = Config.moonlightcafelogo

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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
    setPopup({ message, type, visible: true });

    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showPopup('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendurl}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: formData.mobile,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status !== 200) {
        showPopup(data.message || 'Registration failed', 'error');
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
        }, 2500);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      showPopup('Something went wrong. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-box">
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
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
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
      {popup.visible && (
        <div className={`popup ${popup.type}`}>
          {popup.message}
          <span
            className="material-symbols-outlined close-icon"
            tabIndex="-1"
            onClick={() => setPopup({ ...popup, visible: false })}
          >
            close
          </span>
        </div>
      )}
    </div>
  );
};

export default RegistrationPage;
