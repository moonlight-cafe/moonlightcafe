import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect } from "react";
import "./ResetPassword.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";

const BackendAPIs = SharedAPI;
const Config = SharedConfig;
const Methods = SharedMethod;

export default function ResetPassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [popup, setPopup] = useState({ message: "", type: "", visible: false });
    const [loading, setLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [verifyingToken, setVerifyingToken] = useState(true);

    const showPopup = (message, type = "error") => Methods.showPopup(setPopup, { current: null }, message, type, 5000);

    useEffect(() => {
        const verifyToken = async () => {
            const email = localStorage.getItem("verified_otp");
            const token = localStorage.getItem("reset_token");
            if (!token || !email) { navigate("/login"); return; }
            try {
                const response = await BackendAPIs.VerifyTokenOTP(token, email);
                if (response.status === 200) { setIsValidToken(true); } 
                else { showPopup("Invalid or expired session."); setTimeout(() => navigate("/login"), 3000); }
            } catch (error) { navigate("/login"); }
            finally { setVerifyingToken(false); }
        };
        verifyToken();
    }, [navigate]);

    const handleResetClick = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return showPopup("Passwords do not match");
        if (newPassword.length < 6) return showPopup("Password must be at least 6 characters");
        setShowConfirmModal(true);
    };

    const confirmReset = async () => {
        setShowConfirmModal(false);
        const email = localStorage.getItem("verified_otp");
        setLoading(true);
        try {
            const response = await BackendAPIs.PasswordUpdate(email, newPassword, confirmPassword);
            if (response.status === 200) {
                showPopup("Success! Password updated.", "success");
                localStorage.removeItem("verified_otp");
                localStorage.removeItem("reset_token");
                setTimeout(() => navigate('/login'), 2000);
            } else { showPopup(response.message || "Failed to reset password."); }
        } catch (err) { showPopup("Server error."); }
        finally { setLoading(false); }
    };

    if (verifyingToken) return <div className="reset-page-wrapper"><Navbar /><div className="profile-loader">{Methods.showLoader()}</div></div>;

    return (
        <div className="reset-page-wrapper user-not-select">
            <Navbar />
            <div className="reset-content-area">
                <div className="reset-glass-card">
                    <div className="reset-header-zone">
                        <div className="reset-icon-box">
                            <span className="material-symbols-outlined">lock_open</span>
                        </div>
                        <h2>Create New Password</h2>
                        <p>Set a secure password for your Moonlight Account.</p>
                    </div>

                    <form onSubmit={handleResetClick} className="reset-form-grid">
                        <div className="reset-field-block">
                            <label>New password</label>
                            <div className="reset-input-wrapper">
                                <span className="material-symbols-outlined">password</span>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    value={newPassword} 
                                    onChange={e => setNewPassword(e.target.value)} 
                                    required 
                                />
                                <span 
                                    className="material-symbols-outlined visibility-eye" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </div>
                        </div>

                        <div className="reset-field-block">
                            <label>Confirm password</label>
                            <div className="reset-input-wrapper">
                                <span className="material-symbols-outlined">verified</span>
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={confirmPassword} 
                                    onChange={e => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>

                        <button className="reset-submit-btn" type="submit" disabled={loading}>
                            {loading ? "Updating Securely..." : "Reset Password"}
                        </button>
                    </form>

                    <div className="reset-footer-note">
                        <p>Tip: Use a mix of letters, numbers, and symbols.</p>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {showConfirmModal && (
                <div className="modal-backdrop" onClick={() => setShowConfirmModal(false)}>
                    <div className="modal-content-glass" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Verify Action</h3>
                            <button className="close-modal" onClick={() => setShowConfirmModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to finalize this password change? This action is permanent.</p>
                            <button className="modal-submit-btn" onClick={confirmReset}>Confirm & Update</button>
                        </div>
                    </div>
                </div>
            )}

            {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
        </div>
    );
}
