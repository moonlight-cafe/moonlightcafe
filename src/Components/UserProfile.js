import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import "./UserProfile.css";
import { useNavigate } from "react-router-dom";

const BackendApis = SharedAPI;
const Config = SharedConfig;
const Methods = SharedMethod;
const cafelogo = Config.moonlightcafelogo;

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

    const showPopup = (message, type = "error") => {
        Methods.showPopup(setPopup, popupTimer, message, type, 5000);
    };

    const nameInputRef = useRef(null);
    const emailInputRef = useRef(null);
    const numberInputRef = useRef(null);

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customer = Methods.getCookie("customerdata");
                if (!customer) {
                    setError("No customer data found in cookies.");
                    setLoading(false);
                    return;
                }

                const response = await BackendApis.FetchCustomerDetails(customer._id)

                if (response.status === 200) {
                    setUserData(response.data[0]);
                    setUpdatedData(response.data[0]);
                } else {
                    setError(response.message || "Failed to fetch data.");
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
            const response = await BackendApis.UpdateCustomerDetails(updatedData._id, updatedData.name, updatedData.email, updatedData.number);

            if (response.status === 200) {
                showPopup(response.message, "success");
                setUserData(updatedData);
                setEditFields({ name: false, email: false, number: false });
            }
            else {
                showPopup(response.message, "error");
            }
        } catch (err) {

            showPopup("Something went wrong while saving changes.", "error");
        }
    };

    let userId = null;
    try {
        const customerData = Methods.getCookie('customerdata');
        userId = customerData._id || null;
    } catch {
        userId = null;
    }

    const handleLogout = () => {
        Methods.deleteCookie("customerdata");
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
        navigate('/change/password');
        showPopup("You requested a password change recently.", "info");
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
                <img src={cafelogo} alt="Moonlight Cafe" style={{ width: "200px", userSelect: "none" }} />
                <h2 className="user-profile-title">Customer Profile</h2>

                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red", userSelect: 'none' }}>{error}</p>}

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
            {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
        </div>
    );
}
