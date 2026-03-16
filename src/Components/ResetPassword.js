import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect } from "react";
import "./ResetPassword.css";

import { useNavigate } from "react-router-dom";
const BackendAPIs = SharedAPI;

const Config = SharedConfig;
const Methods = SharedMethod;
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
        const [verifyingToken, setVerifyingToken] = useState(true); // New

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, { current: null }, message, type, 5000);
        };
        useEffect(() => {
                const verifyToken = async () => {
                        const email = localStorage.getItem("verified_otp");
                        const token = localStorage.getItem("reset_token");

                        if (!token || !email) {
                                setVerifyingToken(false);
                                navigate("/login");
                                return;
                        }

                        try {
                                const response = await BackendAPIs.VerifyTokenOTP(token, email)


                                if (response.status === 200) {
                                        setIsValidToken(true);
                                } else {
                                        showPopup(response.message || "Invalid or expired token");
                                        setTimeout(() => {
                                                navigate("/login");
                                        }, 5000);
                                }
                        } catch (error) {
                                console.error("Token verification failed", error);
                                navigate("/login");
                        } finally {
                                setVerifyingToken(false);
                        }
                };

                verifyToken();
        }, [navigate]);

        if (verifyingToken) {
                return (
                        <div className="full-height-page">
                                <div className="loading-service">
                                        {Methods.showLoader()}
                                </div>
                        </div>
                );
        }

        if (!isValidToken) {
                return (
                        <>
                                {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
                        </>
                );
        }


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
                        email = localStorage.getItem("verified_otp");
                }
                setLoading(true);
                try {
                        const response = await BackendAPIs.PasswordUpdate(email, newPassword, confirmPassword)
                        if (response.status === 200) {
                                showPopup(response.message || "Password updated successfully!", "success");
                                localStorage.removeItem("verified_otp");
                                localStorage.removeItem("reset_token");

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
                                localStorage.removeItem("verified_otp");
                                localStorage.removeItem("reset_token");
                                showPopup(response.message || "Failed to reset password.");
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
                        <div className="common-box-comtainer">
                                <div className="common-box">
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
                                </div>
                        </div>

                        {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
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
