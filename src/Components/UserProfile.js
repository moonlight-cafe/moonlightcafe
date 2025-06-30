import React, { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./UserProfile.css";
import _Config from "../Config.js";
import { useNavigate } from "react-router-dom";
import _Methods from "../Methods.js";

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;
const cafelogo = Config.moonlightcafelogo;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

export default function UserProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [popup, setPopup] = useState({ message: "", type: "", visible: false });
    const popupTimer = useRef(null);
    const [editFields, setEditFields] = useState({
        name: false,
        email: false,
        number: false,
    });
    const [updatedData, setUpdatedData] = useState({});

    useEffect(() => {
        const loginCheck = Methods.checkLoginStatus();

        if (loginCheck.status !== 200) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            navigate("/login");
            return;
        }
    }, [navigate]);

    const showPopup = (message, type = "error") => {
        setPopup({ message, type, visible: true });
        if (popupTimer.current) clearTimeout(popupTimer.current);
        popupTimer.current = setTimeout(() => {
            setPopup((prev) => ({ ...prev, visible: false }));
        }, 5000);
    };

    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const numberInputRef = useRef(null);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customerCookie = Cookies.get("customerdata");
                if (!customerCookie) {
                    setError("No customer data found in cookies.");
                    setLoading(false);
                    return;
                }

                const customer = JSON.parse(customerCookie);
                const response = await axios.post(`${backendurl}customer/details`, {
                    _id: customer._id,
                });

                if (response.data.status === 200) {
                    setUserData(response.data.data[0]);
                    setUpdatedData(response.data.data[0]);
                } else {
                    setError(response.data.message || "Failed to fetch data.");
                }
            } catch (err) {
                setError("Error fetching customer details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCustomerData();
    }, []);

    const handleFieldChange = (field, value) => {
        setUpdatedData(prev => ({ ...prev, [field]: value }));
    };

    const toggleEdit = (field) => {
        setEditFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        try {
            const customerrespdata = {
                _id: updatedData._id,
                name: updatedData.name,
                email: updatedData.email,
                number: updatedData.number
            };
            const response = await axios.post(`${backendurl}customer/update`, customerrespdata);
            if (response.data.status === 200) {
                showPopup(response.data.message, "success");
                setUserData(updatedData);
                setEditFields({ name: false, email: false, number: false });
            } else {
                showPopup(response.data.message, "error");
            }
        } catch (err) {
            showPopup("Something went wrong while saving changes.", "error");
        }
    };

    let userId = null;
    try {
        const customerData = getCookie('customerdata');
        if (customerData) {
            const parsed = JSON.parse(decodeURIComponent(customerData));
            userId = parsed._id || null;
        }
    } catch {
        userId = null;
    }

    const handleLogout = () => {
        Cookies.remove("customerdata");
        if (userId) {
            navigate(`/user/logout/${userId}`);
        } else {
            navigate('/home');
        }
    };

    const handleHome = () => {
        window.location.href = "/home";
    };

    const handleChangePwd = () => {
        const cookieName = "customerdata";

        const cookies = document.cookie.split("; ");
        const customerCookie = cookies.find((row) => row.startsWith(`${cookieName}=`));

        if (customerCookie) {
            try {
                const rawValue = decodeURIComponent(customerCookie.split("=")[1]);
                const customerData = JSON.parse(rawValue);

                customerData.ispwdchenagereq = 1;
                const expires = new Date();
                expires.setTime(expires.getTime() + 2 * 60 * 60 * 1000);
                document.cookie = `${cookieName}=${encodeURIComponent(
                    JSON.stringify(customerData)
                )}; expires=${expires.toUTCString()}; path=/`;
            } catch (err) {
                console.error("Failed to parse or update cookie:", err);
            }
        }

        navigate('/change/password');
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editFields.name && nameInputRef.current && !nameInputRef.current.contains(event.target)) {
                setEditFields(prev => ({ ...prev, name: false }));
                setUserData(updatedData);
            }
            if (editFields.email && emailInputRef.current && !emailInputRef.current.contains(event.target)) {
                setEditFields(prev => ({ ...prev, email: false }));
                setUserData(updatedData);
            }
            if (editFields.number && numberInputRef.current && !numberInputRef.current.contains(event.target)) {
                setEditFields(prev => ({ ...prev, number: false }));
                setUserData(updatedData);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [editFields, updatedData]);

    return (
        <div className="user-profile-container">
            <div className="user-profile-card">
                <img src={cafelogo} alt="Moonlight Cafe" style={{ width: "200px" }} />
                <h2 className="user-profile-title">Customer Profile</h2>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                {userData && (
                    <>
                        {/* Name Field */}
                        <div className="user-field-group">
                            <label className="user-field-label">Name:- </label>
                            {editFields.name ? (
                                <input
                                    ref={nameInputRef}
                                    className="user-edit-input"
                                    type="text"
                                    value={updatedData.name || ""}
                                    onChange={(e) => handleFieldChange("name", e.target.value)}
                                />
                            ) : (
                                <div className="user-field-value" onClick={() => toggleEdit("name")}>
                                    {userData.name}
                                    <span className="material-symbols-outlined">edit</span>
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="user-field-group">
                            <label className="user-field-label">Email:- </label>
                            {editFields.email ? (
                                <input
                                    ref={emailInputRef}
                                    className="user-edit-input"
                                    type="email"
                                    value={updatedData.email || ""}
                                    onChange={(e) => handleFieldChange("email", e.target.value)}
                                />
                            ) : (
                                <div className="user-field-value" onClick={() => toggleEdit("email")}>
                                    {userData.email}
                                    <span className="material-symbols-outlined">edit</span>
                                </div>
                            )}
                        </div>

                        {/* Number Field */}
                        <div className="user-field-group">
                            <label className="user-field-label">Mobile:-</label>
                            {editFields.number ? (
                                <input
                                    ref={numberInputRef}
                                    className="user-edit-input"
                                    type="text"
                                    value={updatedData.number || ""}
                                    onChange={(e) => handleFieldChange("number", e.target.value)}
                                />
                            ) : (
                                <div className="user-field-value" onClick={() => toggleEdit("number")}>
                                    {userData.number}
                                    <span className="material-symbols-outlined">edit</span>
                                </div>
                            )}
                        </div>

                        <div
                            className="change-password-link"
                            onClick={handleChangePwd}
                        >
                            Change Password
                        </div>

                        <div className="profile-button-group">
                            <button className="edit-profile-btn" onClick={handleSave}>
                                Save Changes
                            </button>
                            <button className="logout-btn-profile" onClick={handleLogout}>
                                Logout
                            </button>
                            <button className="edit-profile-btn" onClick={handleHome}>
                                Home
                            </button>
                        </div>

                    </>
                )}
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
    );
}
