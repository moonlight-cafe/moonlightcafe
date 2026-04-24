import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";

const method = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;
const cafelogo = Config.moonlightcafetext;
const cafelogosquare = Config.moonlightcafelogosquare;
const googleLogo = Config.googleLogo;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const showPopup = (message, type = "error") => {
    method.showPopup(setPopup, popupTimer, message, type);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const accessResp = await BackendAPIs.GetAccessToken(email);
      if (accessResp.status !== 200) {
        showPopup(accessResp.message || "Access token failed");
        return;
      }

      const response = await BackendAPIs.Login(email, password);

      if (response.status === 200) {
        handleLoginSuccess(response.name);
      } else {
        showPopup(response.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      showPopup("Network error or server unreachable");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const accessResp = await BackendAPIs.GetAccessToken(user.email);
      if (accessResp.status !== 200) {
        showPopup(accessResp.message || "Access token failed");
        return;
      }

      const response = await BackendAPIs.GoogleLogin(
        user.displayName,
        user.email,
        user.phoneNumber
      );

      if (response.status === 200) {
        handleLoginSuccess(user.displayName || "User");
      } else {
        showPopup(response.message || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      showPopup("Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userName) => {
    setName(userName);
    setSplashVisible(true);
    setPopup({ message: "", type: "", visible: false });

    const redirectPath = localStorage.getItem("redirectAfterLogin") || "/home";
    localStorage.removeItem("redirectAfterLogin");

    setTimeout(() => {
      window.location.href = redirectPath;
    }, 6000);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showPopup("Please enter your email before proceeding");
      return;
    }

    try {
      const response = await BackendAPIs.SendOTP(email);

      if (response.status === 200) {
        showPopup("OTP sent successfully", "success");

        setTimeout(() => {
          localStorage.setItem("otpRequestedFor", email);
          navigate(`/verify/otp?email=${email}`);
        }, 800);
      } else {
        showPopup(response.message || "Failed to send OTP");
      }
    } catch (err) {
      showPopup("Server error while sending OTP");
    }
  };

  return (
    <>
      {splashVisible ? (
        <div className="splash-screen user-not-select">
          <img src={cafelogosquare} alt="Logo" className="splash-logo" />
          <p className="user-welcome">Hello, {name || "Guest"}</p>
          <p className="welcome-message green">Welcome back to Moonlight Cafe!</p>
          <div className="loading-bar-container">
            <div className="loading-bar-progress"></div>
          </div>
          <p className="designer-message">Developed by Jainil and Team.</p>
        </div>
      ) : (
        <div className="auth-outer-wrapper user-not-select">
          <div className="auth-left-panel">
            <div className="auth-left-content">
              <h1 className="auth-welcome-title">Welcome To</h1>
              <div className="auth-logo-stack">
                <img src={cafelogosquare} alt="Logo" className="auth-logo-sq" />
                <img src={cafelogo} alt="Moonlight Cafe" className="auth-logo-tx" />
              </div>
              <p className="auth-left-tagline">
                Experience the magic of handcrafted brews and artisanal delights.
              </p>
            </div>
          </div>

          <div className="auth-right-panel">
            <div className="auth-form-card">
              <div className="auth-header">
                <h2>Login</h2>
                <p>Welcome back! Please enter your details.</p>
              </div>

              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-input-group">
                  <label className="main-color fs-18">Email</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">mail</span>
                    <input
                      type="text"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="main-color fs-18">Password</label>
                  <div className="input-wrapper">
                    <span className="material-symbols-outlined input-icon">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="material-symbols-outlined visibility-trigger"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                  <div className="auth-extra-actions">
                    <span className="forgot-trigger fs-16" onClick={handleForgotPassword}>
                      Forgot Password?
                    </span>
                  </div>
                </div>

                <button className="main-btn fs-18" type="submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-loader"></span>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <p className="auth-switch-link">
                New to Moonlight Cafe? <a href="/register">Create an account</a>
              </p>
            </div>
          </div>
          {method.renderPopup(popup, () => method.hidePopup(setPopup, popupTimer))}
        </div>
      )}
    </>
  );
}

export default Login;
