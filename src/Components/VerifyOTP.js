import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./VerifyOTP.css";
import _Config from "../Config";
import usePopup from "./usePopUp";
import { useNavigate } from "react-router-dom";

const Config = new _Config();
const backendurl = Config.backendurl;
const cafelogo = Config.moonlightcafelogo;

export default function VerifyOTP() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const inputsRef = useRef([]);
    const email = localStorage.getItem("otp_email");

    useEffect(() => {
        if (!email) {
            navigate("/forgetpassword");
            return;
        }
    }, [email, navigate]);

    const { popup, showPopup, hidePopup } = usePopup();

    useEffect(() => {
        inputsRef.current[0]?.focus();
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (element, index) => {
        const val = element.value.replace(/\D/g, "");
        if (!val) return;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);
        if (index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            const newOtp = [...otp];
            if (otp[index]) {
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        }
    };

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData("text").trim().slice(0, 6);
        if (!/^\d{1,6}$/.test(pasteData)) return;
        const newOtp = pasteData.split("").concat(new Array(6 - pasteData.length).fill(""));
        setOtp(newOtp);
        inputsRef.current[pasteData.length - 1]?.focus();
    };

    const handleVerify = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            showPopup("Please enter all 6 digits.");
            return;
        }
        setLoading(true);
        try {
            console.log("Verifying OTP with:", { email, otp: otpValue });

            const response = await axios.post(`${backendurl}verify/otp`, {
                email,
                otp: otpValue,
            });

            console.log("Response:", response.data);

            if (response.data.status === 200) {
                const token = response.data.token;

                showPopup("OTP verified successfully!", "success");
                setTimeout(() => {
                    window.location.href = `/reset/password?token=${token}`;
                }, 1000);
            } else {
                showPopup(response.data.message || "Invalid OTP.");
            }
        } catch (err) {
            console.error("Verification error:", err);
            const errorMsg =
                err.response?.data?.message || err.message || "Verification failed.";
            showPopup(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        setLoading(true);
        try {
            if (!email) throw new Error("No email found.");

            const response = await axios.post(`${backendurl}send/otp`, { email });

            if (response.data.status === 200) {
                showPopup("OTP resent to your email.", "success");
                setTimer(60);
            } else {
                showPopup(response.data.message || "Failed to resend OTP.");
            }
        } catch (err) {
            console.error("Resend OTP error:", err);
            showPopup("Error resending OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => {
        Cookies.remove("customerdata");
        localStorage.removeItem("otp_email");
        window.location.href = "/login";
    };

    return (
        <div className="user-profile-container">
            <div className="user-profile-card">
                <img src={cafelogo} alt="Cafe Logo" style={{ width: "180px", marginBottom: "20px" }} />
                <h2 className="user-profile-title">Verify OTP</h2>
                <p className="otp-instructions">Enter the 6-digit OTP sent to your registered email.</p>

                <div className="otp-input-container" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            type="text"
                            maxLength="1"
                            className={`otp-digit-box ${digit === "" ? "empty" : ""}`}
                            value={digit}
                            ref={(el) => (inputsRef.current[idx] = el)}
                            onChange={(e) => handleChange(e.target, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                        />
                    ))}
                </div>

                <div className="change-password-link" onClick={handleLogin}>
                    Back to Login Page
                </div>

                <div className="otp-button-group">
                    <button className="otp-btn" onClick={handleVerify} disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                    <button className="otp-btn" onClick={handleResend} disabled={loading || timer > 0}>
                        {loading ? "Resending..." : timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                    </button>
                </div>
            </div>
            {popup.visible && (
                <div className={`popup ${popup.type}`}>
                    {popup.message}
                    <span
                        className="material-symbols-outlined close-icon"
                        tabIndex="-1"
                        onClick={hidePopup}
                    >
                        close
                    </span>
                </div>
            )}
        </div>
    );
}
