import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect, useRef } from "react";
import "./VerifyOTP.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar.js";

const BackendApis = SharedAPI;
const Config = SharedConfig;
const Methods = SharedMethod;

export default function VerifyOTP() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get("email");

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const popupTimer = useRef(null);

    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);

    const [popup, setPopup] = useState({ message: "", type: "", visible: false });

    const showPopup = (message, type = "error") => Methods.showPopup(setPopup, popupTimer, message, type);

    useEffect(() => {
        const storedEmail = localStorage.getItem("otpRequestedFor");
        if (!storedEmail || storedEmail !== email) { navigate("/login"); return; }
        inputRefs.current[0]?.focus();
        startTimer();
        return () => Methods.hidePopup(setPopup, popupTimer);
    }, [email, navigate]);

    const startTimer = () => setResendTimer(30);

    useEffect(() => {
        if (resendTimer === 0) return;
        const interval = setInterval(() => setResendTimer((sec) => sec - 1), 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleOTPChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
        if (newOtp.join("").length === 6) verifyOTP(newOtp.join(""));
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && index > 0 && otp[index] === "") inputRefs.current[index - 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();
        if (!/^[0-9]{6}$/.test(pasteData)) return;
        const digits = pasteData.split("");
        setOtp(digits);
        verifyOTP(pasteData);
    };

    const verifyOTP = async (givenOTP = null) => {
        const code = givenOTP || otp.join("");
        if (code.length !== 6) return showPopup("Enter the 6-digit OTP correctly");

        setVerifyLoading(true);
        try {
            const response = await BackendApis.VerifyOTP(email, code);
            if (response.status === 200) {
                showPopup(response.message || "OTP verified successfully!", "success");
                localStorage.setItem("verified_otp", email);
                localStorage.setItem("reset_token", response.token);
                setTimeout(() => navigate("/reset/password"), 800);
            } else { showPopup(response.message || "Invalid OTP"); }
        } catch (error) { showPopup("Verification failed."); }
        finally { setVerifyLoading(false); }
    };

    const resendOTP = async () => {
        if (resendTimer > 0) return;
        setResendLoading(true);
        try {
            const response = await BackendApis.SendOTP(email);
            if (response.status === 200) {
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
                showPopup("OTP sent again", "success");
                startTimer();
            } else { showPopup("Failed to resend OTP"); }
        } catch (err) { showPopup("Network error."); }
        finally { setResendLoading(false); }
    };

    return (
        <div className="otp-page-wrapper user-not-select">
            <Navbar />
            <div className="otp-content-area">
                <div className="otp-glass-card">
                    <div className="otp-header-zone">
                        <div className="otp-icon-shield">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                        <h2>Verification Code</h2>
                        <p>We've sent a 6-digit security code to <br/><span>{email}</span></p>
                    </div>

                    <div className="otp-input-row">
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                type="text"
                                maxLength="1"
                                className={`otp-box-unit ${digit ? 'filled' : ''}`}
                                value={digit}
                                onChange={(e) => handleOTPChange(e.target.value, idx)}
                                onKeyDown={(e) => handleBackspace(e, idx)}
                                onPaste={handlePaste}
                                disabled={verifyLoading}
                            />
                        ))}
                    </div>

                    <div className="otp-actions-zone">
                        <button className="otp-verify-btn" onClick={() => verifyOTP()} disabled={verifyLoading}>
                            {verifyLoading ? "Verifying..." : "Secure Verify"}
                        </button>
                        
                        <div className="resend-info">
                            {resendTimer > 0 ? (
                                <p>You can resend in <span>{resendTimer}s</span></p>
                            ) : (
                                <button className="resend-trigger" onClick={resendOTP} disabled={resendLoading}>
                                    {resendLoading ? "Sending..." : "Request New Code"}
                                </button>
                            )}
                        </div>

                        <button className="otp-back-link" onClick={() => navigate('/login')}>
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
