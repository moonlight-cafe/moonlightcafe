import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import { auth, provider } from "../firebase.js";
import { signInWithPopup } from "firebase/auth";

const method = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;
const cafelogo = Config.moonlightcafelogo;
const googleLogo = Config.googleLogo;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [splashVisible, setSplashVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);
  const [name, setName] = useState("")
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

      // ✅ Use Google email, not state email
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
        // ✅ Use Google display name
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

    const redirectPath =
      localStorage.getItem("redirectAfterLogin") || "/";
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
        <div className="splash-screen">
          <img src={cafelogo} alt="Logo" className="splash-logo" />
          {<p className="user-welcome p-10">Hello, {name || "User123456"}</p>}
          <p className="welcome-message green p-10">Welcome back to Moonlight Cafe!</p>
          <p className="designer-message green p-10">Developed by Jainil and Team.</p>
        </div>
      ) : (
        <>
          {/* <Navbar /> */}
          <div className="common-box-comtainer">
            <div className="common-box">
              <img
                src={cafelogo}
                alt="Moonlight Cafe"
                style={{ width: "200px", marginBottom: "40px", userSelect: "none" }}
              />

              <form onSubmit={handleLogin}>
                <div className="loginform-group">
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ userSelect: "none" }}
                  />
                </div>

                <div className="loginform-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ userSelect: "none" }}
                  />
                  <span
                    className="material-symbols-outlined visibility-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ cursor: "pointer", marginLeft: "10px", userSelect: "none" }}
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>

                <div className="loginform-group">
                  <div className="forgot-link-wrapper">
                    <div
                      className="forgot-password-text"
                      onClick={handleForgotPassword}
                      style={{ cursor: "pointer" }}
                    >
                      Forgot password?
                    </div>
                  </div>
                </div>

                <button className="login-button" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {/* ✅ Google Login Button */}
              <button className="google-login-button" onClick={handleGoogleLogin}>
                <img
                  src={googleLogo}
                  alt="Google"
                  style={{ width: "20px", marginRight: "10px" }}
                />
                Continue with Google
              </button>

              <p className="register-link">
                New to Moonlight Cafe? <a href="/register">Click here to register</a>
              </p>
            </div>

            {method.renderPopup(popup, () =>
              method.hidePopup(setPopup, popupTimer)
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Login;
