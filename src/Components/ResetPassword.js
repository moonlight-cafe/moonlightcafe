import React, { useState, useEffect } from "react";
import "./ResetPassword.css";

import _Config from "../Config.js";
import _Methods from "../Methods.js";
import { useNavigate } from "react-router-dom";

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;
const cafelogo = Config.moonlightcafelogo;

export default function ResetPassword() {
        const navigate = useNavigate();
        const [newPassword, setNewPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const [loading, setLoading] = useState(false);
        const [isValidToken, setIsValidToken] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [showcnfPassword, setShowcnfPassword] = useState(false);
        const [showConfirmModal, setShowConfirmModal] = useState(false);

        const showPopup = (message, type = "error") => {
                setPopup({ message, type, visible: true });
                setTimeout(() => {
                        setPopup((prev) => ({ ...prev, visible: false }));
                }, 4000);
        };

        useEffect(() => {
                const params = new URLSearchParams(window.location.search);
                const token = params.get("token");
                const email = localStorage.getItem("otp_email");
                if (!token || !email) {
                        navigate("/forgetpassword");
                        return;
                }

                fetch(`${backendurl}verify/otp/token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ verify: token, email }),
                })
                        .then((res) => res.json())
                        .then((data) => {
                                if (data.status === 200) {
                                        setIsValidToken(true);
                                } else {
                                        showPopup(data.message || "Invalid or expired token");
                                        navigate("/login");
                                }
                        })
                        .catch((err) => {
                                console.error("Token verification failed", err);
                                navigate("/login");
                        });
        }, [navigate]);

        const handleResetClick = (e) => {
                e.preventDefault();

                if (newPassword !== confirmPassword) {
                        showPopup("Passwords do not match");
                        return;
                }

                if (newPassword.length < 6) {
                        showPopup("Password must be at least 6 characters");
                        return;
                }

                setShowConfirmModal(true);
        };

        const confirmReset = async () => {
                setShowConfirmModal(false);
                let email;
                const checklogin = Methods.checkLoginStatus();

                if (checklogin.status === 200) {
                        email = checklogin.data.email;
                } else {
                        email = localStorage.getItem("otp_email");
                }

                setLoading(true);

                try {
                        const response = await fetch(`${backendurl}customer/update/pwd`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        email,
                                        password: newPassword,
                                        cnfpassword: confirmPassword,
                                }),
                        });

                        const data = await response.json();
                        if (data.status === 200) {
                                showPopup("Password updated successfully!", "success");
                                localStorage.removeItem("otp_email");

                                let redirecturl = "profile";
                                const cookie = document.cookie.split("; ").find((c) => c.startsWith("selectedTable="));
                                if (cookie) {
                                        try {
                                                const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
                                                if (parsed.redirecturl) {
                                                        redirecturl = parsed.redirecturl;
                                                }
                                        } catch (e) {
                                                console.error("Invalid selectedTable cookie format");
                                        }
                                }
                                setTimeout(() => navigate(`/user/profile/${redirecturl}`), 2000);
                        } else {
                                showPopup(data.message || "Failed to reset password.");
                        }
                } catch (err) {
                        showPopup("Server error. Try again later.");
                } finally {
                        setLoading(false);
                }
        };

        if (!isValidToken) return null;

        return (
                <>
                        <div className="reset-container">
                                <div className="resetform-container">
                                        <div className="border-reset">
                                                <img src={cafelogo} alt="Moonlight Cafe" style={{ width: "200px", marginBottom: "40px" }} />
                                                <p style={{ color: "red" }}><strong>Note:</strong> Please do not close or refresh the page.</p>

                                                <form onSubmit={handleResetClick}>
                                                        <div className="loginform-group password-group">
                                                                <input
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="New Password"
                                                                        value={newPassword}
                                                                        onChange={(e) => setNewPassword(e.target.value)}
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
                                                                        type={showcnfPassword ? "text" : "password"}
                                                                        placeholder="Confirm Password"
                                                                        value={confirmPassword}
                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                        required
                                                                />
                                                                <span
                                                                        className="material-symbols-outlined visibility-icon"
                                                                        onClick={() => setShowcnfPassword((prev) => !prev)}
                                                                        style={{ cursor: "pointer", marginLeft: "10px", userSelect: "none" }}
                                                                >
                                                                        {showcnfPassword ? "visibility_off" : "visibility"}
                                                                </span>
                                                        </div>

                                                        <button className="reset-button" type="submit" disabled={loading}>
                                                                {loading ? "Updating..." : "Reset Password"}
                                                        </button>
                                                </form>

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
                        </div>

                        {showConfirmModal && (
                                <div className="modal-overlay">
                                        <div className="modal-content-select">
                                                <span className="material-symbols-outlined modal-icon">
                                                        lock_reset
                                                </span>
                                                <p>Are you sure you want to change your password?</p>
                                                <p className="note">Note: This action cannot be undone.</p>
                                                <div className="modal-buttons">
                                                        <button onClick={confirmReset}>Yes</button>
                                                        <button onClick={() => setShowConfirmModal(false)}>No</button>
                                                </div>
                                        </div>
                                </div>
                        )}
                </>
        );
}
