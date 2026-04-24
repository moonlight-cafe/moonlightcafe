import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef } from 'react';
import './Login.css'; // Reusing Login.css for consistent split-screen layout

const Method = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;
const cafelogo = Config.moonlightcafetext;
const cafelogosquare = Config.moonlightcafelogosquare;

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
        showPopup('Registration successful! Redirecting...', 'success');
        setFormData({
          name: '',
          email: '',
          number: '',
          password: '',
          confirmPassword: '',
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      showPopup('Something went wrong. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-outer-wrapper user-not-select">
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <h1 className="auth-welcome-title">Join Us At</h1>
          <div className="auth-logo-stack">
            <img src={cafelogosquare} alt="Logo" className="auth-logo-sq" />
            <img src={cafelogo} alt="Moonlight Cafe" className="auth-logo-tx" />
          </div>
          <p className="auth-left-tagline">
            Register now to save your favorites, track orders, and unlock exclusive rewards.
          </p>
        </div>
      </div>

      <div className="auth-right-panel">
        <div className="auth-form-card register-card">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Start your delicious journey with us today.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="main-color fs-16">Name</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">person</span>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-row">
              <div className="auth-input-group">
                <label className="main-color fs-16">Email</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="auth-input-group">
                <label className="main-color fs-16">Mobile</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">phone</span>
                  <input
                    type="tel"
                    name="number"
                    placeholder="1234567890"
                    value={formData.number}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-input-row">
              <div className="auth-input-group">
                <label className="main-color fs-16">Password</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <span className="material-symbols-outlined visibility-trigger" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>
              <div className="auth-input-group">
                <label className="main-color fs-16">Confirm</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">verified</span>
                  <input
                    type={cnfshowPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span className="material-symbols-outlined visibility-trigger" onClick={() => setcnfShowPassword(!cnfshowPassword)}>
                    {cnfshowPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>
            </div>

            <button className="main-btn" type="submit" disabled={loading}>
              {loading ? <span className="btn-loader"></span> : <span className="fs-18">Create Account</span>}
            </button>
          </form>

          <p className="auth-switch-link">
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
      {Method.renderPopup(popup, () => Method.hidePopup(setPopup, popupTimer))}
    </div>
  );
};

export default RegistrationPage;
