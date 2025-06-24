import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgetPassword.css';
import _Config from '../Config.js';

const Config = new _Config();
const backendurl = Config.backendurl;
const navcafeimg = Config.moonlightcafelogo;

function ForgetPassword() {
        const [contact, setContact] = useState('');
        const [emailSent, setEmailSent] = useState(false);
        const [loading, setLoading] = useState(false);
        const [popup, setPopup] = useState({ message: '', type: '', visible: false });

        const popupTimer = useRef(null);
        const navigate = useNavigate();

        const showPopup = (message, type = 'error') => {
                setPopup({ message, type, visible: true });

                if (popupTimer.current) clearTimeout(popupTimer.current);

                popupTimer.current = setTimeout(() => {
                        setPopup((prev) => ({ ...prev, visible: false }));
                }, 5000);
        };

        const handleEmail = async (e) => {
                e.preventDefault();

                if (!contact || !contact.includes('@')) {
                        showPopup('Please enter a valid email address.', 'error');
                        return;
                }

                setLoading(true);

                try {
                        const response = await fetch(`${backendurl}send/otp`, {
                                method: 'POST',
                                headers: {
                                        'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ email: contact })
                        });

                        const result = await response.json();

                        if (result.status === 200) {
                                localStorage.setItem('otp_email', contact);
                                showPopup(result.message, 'success');
                                setEmailSent(true);

                                setTimeout(() => {
                                        navigate('/verify/otp');
                                }, 1000);
                        } else {
                                showPopup(result.message || 'Something went wrong', 'error');
                        }
                } catch (err) {
                        console.error(err);
                        showPopup('Something went wrong while sending OTP.', 'error');
                } finally {
                        setLoading(false);
                }
        };

        return (
                <div className="forget-wrapper">
                        <div className="forget-box">
                                <img src={navcafeimg} alt="Moonlight Cafe" style={{ width: '200px' }} />
                                <h2 className="forget-title">Forgot Password</h2>
                                <p className="forget-subtext">
                                        Enter your registered <strong>email</strong> and we’ll send you a reset code.
                                </p>

                                <form onSubmit={handleEmail}>
                                        <input
                                                type="email"
                                                placeholder="example@gmail.com"
                                                className="forget-input"
                                                value={contact}
                                                onChange={(e) => setContact(e.target.value)}
                                                required
                                        />

                                        <div className="button-row">
                                                <button type="submit" className="forget-button half" disabled={loading}>
                                                        {emailSent ? 'Resend OTP to Email' : loading ? 'Sending...' : 'Send OTP to Email'}
                                                </button>
                                        </div>
                                </form>

                                <div className="back-to-login">
                                        <p>
                                                <a href="/login">
                                                        Back to Login <span className="material-symbols-outlined">arrow_forward</span>
                                                </a>
                                        </p>
                                </div>

                        </div>
                        {popup.visible && (
                                <div className={`popup ${popup.type}`}>
                                        {popup.message}
                                        <span
                                                className="material-symbols-outlined close-icon"
                                                tabIndex="-1"
                                                onClick={() => setPopup((prev) => ({ ...prev, visible: false }))}
                                        >
                                                close
                                        </span>
                                </div>
                        )}
                </div>
        );
}

export default ForgetPassword;
