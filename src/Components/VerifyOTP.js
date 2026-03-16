import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect, useRef } from "react";
import "./VerifyOTP.css";
import { useNavigate, useLocation } from "react-router-dom";

const BackendApis = SharedAPI;
const Config = SharedConfig;
const Methods = SharedMethod;
const cafelogo = Config.moonlightcafelogo;

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

    const [popup, setPopup] = useState({
        message: "",
        type: "",
        visible: false,
    });

    const showPopup = (message, type = "error") =>
        Methods.showPopup(setPopup, popupTimer, message, type);

    /* 🔐 Entry Protection (same as Admin) */
    useEffect(() => {
        const storedEmail = localStorage.getItem("otpRequestedFor");

        if (!storedEmail || storedEmail !== email) {
            navigate("/login");
            return;
        }

        inputRefs.current[0]?.focus();
        startTimer();

        return () => Methods.hidePopup(setPopup, popupTimer);
    }, []);

    /* ⏱ Resend Timer */
    const startTimer = () => setResendTimer(30);

    useEffect(() => {
        if (resendTimer === 0) return;
        const interval = setInterval(() => {
            setResendTimer((sec) => sec - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    /* 🔢 OTP Input Logic */
    const handleOTPChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) inputRefs.current[index + 1]?.focus();

        if (newOtp.join("").length === 6) {
            verifyOTP(newOtp.join(""));
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace" && index > 0 && otp[index] === "") {
            inputRefs.current[index - 1]?.focus();
        }
    };

    /* 📋 Paste Support */
    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").trim();

        if (!/^[0-9]{6}$/.test(pasteData)) return;

        const digits = pasteData.split("");
        setOtp(digits);

        digits.forEach((d, i) => {
            if (inputRefs.current[i]) {
                inputRefs.current[i].value = d;
            }
        });

        verifyOTP(pasteData);
    };

    /* ✅ Verify OTP */
    const verifyOTP = async (givenOTP = null) => {
        const code = givenOTP || otp.join("");

        if (code.length !== 6) {
            showPopup("Enter the 6-digit OTP correctly");
            return;
        }

        setVerifyLoading(true);
        try {
            const response = await BackendApis.VerifyOTP(email, code);

            if (response.status === 200) {
                showPopup(response.message || "OTP verified successfully!", "success");

                localStorage.setItem("verified_otp", email);
                localStorage.setItem("reset_token", response.token);
                localStorage.removeItem("otp_email");

                setTimeout(() => navigate("/reset/password"), 800);
            } else {
                showPopup(response.message || "Invalid OTP");
            }
        } catch (error) {
            showPopup("Server error during verification");
        } finally {
            setVerifyLoading(false);
        }
    };

    /* 🔁 Resend OTP */
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
            } else {
                showPopup(response.message || "Failed to resend OTP");
            }
        } catch (err) {
            showPopup("Network error while resending OTP");
        } finally {
            setResendLoading(false);
        }
    };

    /* 🔙 Back to Login */
    const handleLogin = () => {
        Methods.deleteCookie("customerdata");
        localStorage.removeItem("otp_email");
        navigate("/login");
    };

    return (
        <div className="common-box-comtainer">
            <div className="common-box">
                <img src={cafelogo} alt="Cafe Logo" style={{ width: "180px", marginBottom: "20px" }} />

                <h2 className="user-profile-title">Verify OTP</h2>
                <p className="otp-instructions">
                    Enter the 6-digit OTP sent to <br />
                    <b>{email}</b>
                </p>

                <div className="otp-input-container">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            maxLength="1"
                            className={`otp-digit-box ${digit === "" ? "empty" : ""}`}
                            value={digit}
                            onChange={(e) => handleOTPChange(e.target.value, idx)}
                            onKeyDown={(e) => handleBackspace(e, idx)}
                            onPaste={handlePaste}
                            disabled={verifyLoading}
                        />
                    ))}
                </div>

                <div className="change-password-link" onClick={handleLogin}>
                    Back to Login Page
                </div>

                <div className="otp-button-group">
                    <button className="otp-btn" onClick={verifyOTP} disabled={verifyLoading}>
                        {verifyLoading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <button
                        className="otp-btn"
                        onClick={resendOTP}
                        disabled={resendTimer > 0 || resendLoading}
                    >
                        {resendTimer > 0
                            ? `Resend in ${resendTimer}s`
                            : resendLoading
                                ? "Resending..."
                                : "Resend OTP"}
                    </button>
                </div>
            </div>

            {Methods.renderPopup(popup, () =>
                Methods.hidePopup(setPopup, popupTimer)
            )}
        </div>
    );
}
