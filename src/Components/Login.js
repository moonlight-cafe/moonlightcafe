import React, { useState, useRef } from "react";
import "./Login.css";

import _Config from '../Config.js';
const Config = new _Config();
const backendurl = Config.backendurl
const cafelogo = Config.moonlightcafelogo

function Login() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const [splashVisible, setSplashVisible] = useState(false);
  const popupTimer = useRef(null);
  const userNameRef = useRef("");
  const [showPassword, setShowPassword] = useState(false);

  const showPopup = (message, type = "error") => {
    setPopup({ message, type, visible: true });
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${backendurl}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        const customerData = {
          _id: data._id || "",
          name: data.name || "",
          email: data.email || "",
          number: data.number || "",
        };

        const setCookie = (name, value, hours) => {
          const expires = new Date();
          expires.setTime(expires.getTime() + hours * 60 * 60 * 1000);
          document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${expires.toUTCString()};path=/`;
        };

        setCookie("customerdata", customerData, 2);

        setSplashVisible(true);
        setPopup({ message: "", type: "", visible: false });
        setTimeout(() => {
          window.location.href = "/";
        }, 6000);
      } else {
        showPopup(data.message || "Invalid credentials", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showPopup("Network error or server unreachable", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {splashVisible ? (
        <div className="splash-screen">
          <img src={cafelogo} alt="Logo" className="splash-logo" />
          {userNameRef.current && <p className="user-welcome p-10">Hey, {userNameRef.current}</p>}
          <p className="welcome-message green p-10">Welcome back to Moonlight Cafe!</p>
          <p className="designer-message green p-10">Crafted with care by Jainil.</p>
        </div>
      ) : (
        <div className="login-container">
          <div className="loginform-container">
            <div className="border-login">
              <img src={cafelogo} alt="Moonlight Cafe" style={{ width: "200px", marginBottom: "40px" }} />

              <form onSubmit={handleLogin}>
                <div className="loginform-group">
                  <input
                    type="text"
                    placeholder="Email or Mobile Number"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <div className="loginform-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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


                <div className="loginform-group">
                  <div className="forgot-link-wrapper">
                    <a href="/forgetpassword" className="forgot-password-text">
                      Forgot password ?
                    </a>
                  </div>
                </div>


                <button className="login-button" type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="register-link">
                New to Moonlight Cafe?{" "} <a href="/register"> Click here to register </a>
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
        </div>
      )}
    </>
  );
}

export default Login;