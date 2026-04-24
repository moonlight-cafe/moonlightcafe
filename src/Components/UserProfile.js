import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import "./UserProfile.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function UserProfile() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal states for Editing Profile
    const [modalVisible, setModalVisible] = useState(false);
    const [isAnimatingAlertOut, setIsAnimatingAlertOut] = useState(false);

    // Password Modal States
    const [pwdModalVisible, setPwdModalVisible] = useState(false);
    const [isAnimatingPwdAlertOut, setIsAnimatingPwdAlertOut] = useState(false);
    const [pwdData, setPwdData] = useState({ old: "", new: "", confirm: "" });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdVisible, setPwdVisible] = useState({ old: false, new: false, confirm: false });

    const [updatedData, setUpdatedData] = useState({ name: "", email: "", number: "" });

    const [popup, setPopup] = useState({ message: "", type: "", visible: false });
    const popupTimer = useRef(null);

    const showPopup = (message, type = "error") => {
        Methods.showPopup(setPopup, popupTimer, message, type, 5000);
    };

    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const customer = Methods.getCookie("customerdata");
                if (!customer) { navigate('/login'); return; }
                const response = await BackendApis.FetchCustomerDetails(customer._id);
                if (response.status === 200) {
                    setUserData(response.data[0]);
                } else {
                    showPopup(response.message || "Failed to fetch data.");
                }
            } catch (err) { showPopup("Error fetching customer details."); }
            finally { setLoading(false); }
        };
        fetchCustomerData();
    }, [navigate]);

    const openEditModal = () => {
        setUpdatedData({
            name: userData?.name || "",
            email: userData?.email || "",
            number: userData?.number || ""
        });
        setModalVisible(true);
    };

    const closeAlertModal = () => {
        setIsAnimatingAlertOut(true);
        setTimeout(() => {
            setModalVisible(false);
            setIsAnimatingAlertOut(false);
        }, 300);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const response = await BackendApis.UpdateCustomerDetails(userData._id, updatedData.name, updatedData.email, updatedData.number);
            if (response.status === 200) {
                showPopup(response.message, "success");
                setUserData(prev => ({ ...prev, name: updatedData.name, email: updatedData.email, number: updatedData.number }));

                const currentCustomer = Methods.getCookie("customerdata");
                Methods.setCookie("customerdata", { ...currentCustomer, name: updatedData.name, email: updatedData.email, number: updatedData.number }, 30);

                closeAlertModal();
            } else { showPopup(response.message, "error"); }
        } catch (err) { showPopup("Something went wrong while saving changes.", "error"); }
    };

    const openPwdModal = () => {
        setPwdData({ old: "", new: "", confirm: "" });
        setPwdVisible({ old: false, new: false, confirm: false });
        setPwdModalVisible(true);
    };

    const closePwdModal = () => {
        setIsAnimatingPwdAlertOut(true);
        setTimeout(() => {
            setPwdModalVisible(false);
            setIsAnimatingPwdAlertOut(false);
        }, 300);
    };

    const handleUpdatePassword = async () => {
        if (!pwdData.old || !pwdData.new || !pwdData.confirm) return showPopup("Please fill all fields.", "error");
        if (pwdData.new !== pwdData.confirm) return showPopup("Passwords do not match.", "error");
        if (pwdData.old === pwdData.new) return showPopup("New password must be different from the old one.", "error");

        setPwdLoading(true);
        try {
            const response = await BackendApis.CustomerChangePassword(userData.email, pwdData.old, pwdData.new);
            if (response.status === 200) {
                showPopup(response.message, "success");
                closePwdModal();
            } else { showPopup(response.message, "error"); }
        } catch (err) { showPopup("Failed to change password.", "error"); }
        finally { setPwdLoading(false); }
    };

    if (loading) {
        return (
            <div className="profile-page">
                <Navbar />
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                    {Methods.showLoader()}
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <>
            <div className="profile-page user-not-select">
                <Navbar />

                <main className="profile-main">
                    <section className="profile-section">
                        <header className="profile-header">
                            <h1 className="m-0" style={{ color: "#47d9a8", fontSize: "35px" }}>My Profile</h1>
                        </header>

                        <hr className="mt-20" style={{ borderColor: "#47d9a8", opacity: 0.2 }} />

                        <div className="profile-sub-section mt-20">
                            <h3 className="m-0 section-title" style={{ fontSize: "25px" }}>Personal Information</h3>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="profile-item-icon" style={{ fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {Methods.getInitials(userData.name)}
                                    </span>
                                    <div className="info-text">
                                        <p className="info-label">Full Name</p>
                                        <p className="info-value">{userData.name || "-"}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="material-symbols-outlined profile-item-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>mail</span>
                                    <div className="info-text">
                                        <p className="info-label">Email</p>
                                        <p className="info-value">{userData.email || "-"}</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="material-symbols-outlined profile-item-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>call</span>
                                    <div className="info-text">
                                        <p className="info-label">Phone Number</p>
                                        <p className="info-value">{userData.number || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <button className="main-btn mt-20" onClick={openEditModal}>
                                Edit Profile
                            </button>
                        </div>

                        <hr className="mt-20" style={{ margin: "12px 125px", borderColor: "#47d9a8", opacity: 0.2 }} />

                        <div className="profile-sub-section" style={{ marginTop: "20px" }}>
                            <h3 className="m-0 section-title" style={{ fontSize: "25px" }}>Password & Security</h3>

                            <div className="info-grid">
                                <div className="info-item cursor-pointer" onClick={openPwdModal} style={{ cursor: "pointer" }}>
                                    <span className="material-symbols-outlined profile-item-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>password</span>
                                    <div className="info-text">
                                        <p className="info-value" style={{ fontSize: "16px" }}>Change Security Password</p>
                                    </div>
                                    <span className="material-symbols-outlined" style={{ marginLeft: "auto", color: "#47d9a8" }}>edit</span>
                                </div>
                                <div className="info-item cursor-pointer" onClick={() => navigate(`/user/logout/${userData._id}`)} style={{ cursor: "pointer", borderColor: "rgba(255, 82, 82, 0.3)" }}>
                                    <span className="material-symbols-outlined profile-item-icon" style={{ background: "rgba(255, 82, 82, 0.1)", color: "#ff5252", display: "flex", alignItems: "center", justifyContent: "center" }}>logout</span>
                                    <div className="info-text">
                                        <p className="info-value" style={{ fontSize: "16px", color: "#ff5252" }}>Sign Out</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {modalVisible && (
                <div className="modal-overlay-modern" onClick={closeAlertModal}>
                    <div className={`pwd-modal-card ${isAnimatingAlertOut ? "fade-out" : ""}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <h3>Edit Profile</h3>
                        </div>

                        <div className="modal-body-content">
                            <div className="modern-field">
                                <label>Display Name</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type="text"
                                        name="name"
                                        value={updatedData.name}
                                        onChange={handleFieldChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>Contact Email</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type="email"
                                        name="email"
                                        value={updatedData.email}
                                        onChange={handleFieldChange}
                                        required
                                        disabled
                                        style={{ opacity: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>Phone Number</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type="text"
                                        name="number"
                                        value={updatedData.number}
                                        onChange={handleFieldChange}
                                    />
                                </div>
                            </div>

                            <div className="modal-actions-admin-style">
                                <button className="main-btn" onClick={handleSave}>
                                    Save Changes
                                </button>
                                <button className="main-cancle-btn" onClick={closeAlertModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pwdModalVisible && (
                <div className="modal-overlay-modern user-not-select" onClick={closePwdModal}>
                    <div className={`pwd-modal-card ${isAnimatingPwdAlertOut ? "fade-out" : ""}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <h3>Change Password</h3>
                        </div>

                        <div className="modal-body-content">
                            <div className="modern-field">
                                <label>Current Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.old ? "text" : "password"}
                                        value={pwdData.old}
                                        onChange={e => setPwdData({ ...pwdData, old: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, old: !pwdVisible.old })}>
                                        {pwdVisible.old ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>New Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.new ? "text" : "password"}
                                        value={pwdData.new}
                                        onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, new: !pwdVisible.new })}>
                                        {pwdVisible.new ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>Confirm Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.confirm ? "text" : "password"}
                                        value={pwdData.confirm}
                                        onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, confirm: !pwdVisible.confirm })}>
                                        {pwdVisible.confirm ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions-admin-style">
                                <button className="main-btn" onClick={handleUpdatePassword} disabled={pwdLoading}>
                                    {pwdLoading ? "Updating..." : "Update Password"}
                                </button>
                                <button className="main-cancle-btn" onClick={closePwdModal} disabled={pwdLoading}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
        </>
    );
}
