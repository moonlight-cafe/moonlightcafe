import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useRef, useState } from "react";
import "./ChangePassword.css";

import { useNavigate } from "react-router-dom";

const Config = SharedConfig;
const Methods = SharedMethod;
const BackendAPIs = SharedAPI;
const cafelogo = Config.moonlightcafelogo;

export default function ChangePassword() {
        const navigate = useNavigate();

        const [oldPassword, setOldPassword] = useState("");
        const [newPassword, setNewPassword] = useState("");
        const [confirmPassword, setConfirmPassword] = useState("");

        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const [loading, setLoading] = useState(false);

        const [showOld, setShowOld] = useState(false);
        const [showNew, setShowNew] = useState(false);
        const [showCnf, setShowCnf] = useState(false);
        const popupTimer = useRef(null);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type, 5000);
        };

        const handleSubmit = async (e) => {
                e.preventDefault();

                if (!oldPassword || !newPassword || !confirmPassword) {
                        showPopup("All fields are required");
                        return;
                }

                if (newPassword.length < 6) {
                        showPopup("New password must be at least 6 characters");
                        return;
                }

                if (oldPassword === newPassword) {
                        showPopup("New password must be different from old password");
                        return;
                }

                if (newPassword !== confirmPassword) {
                        showPopup("New password and confirm password do not match");
                        return;
                }

                const checklogin = Methods.checkLoginStatus();

                if (checklogin.status !== 200) {
                        showPopup("Login expired. Please login again.");
                        navigate("/login");
                        return;
                }

                const email = checklogin.data.email;
                setLoading(true);

                try {
                        const res = await BackendAPIs.CustomerChangePassword(email, oldPassword, newPassword)
                        console.log("🚀 ~ ChangePassword.js:94 ~ handleSubmit ~ res>>", res);

                        if (res.status === 200) {
                                showPopup(res.message || "Password changed successfully", "success");
                                setTimeout(() => navigate(`/user/profile/${checklogin.data._id}`), 2000);
                        } else {
                                showPopup(res.message || "Failed to change password");
                        }

                } catch (error) {
                        console.error("Error:", error);
                        showPopup(error.response.data.message || "Server error. Try again later.");
                } finally {
                        setLoading(false);
                }
        };

        return (
                <>
                        <div className="changepassword-container">
                                <div className="changepassword-form-container">
                                        <div className="changepassword-border">
                                                <img src={cafelogo} alt="Moonlight Cafe" style={{ width: "200px" }} />
                                                <h2 className="changepwd-heading">Change Password</h2>
                                                <form onSubmit={handleSubmit}>
                                                        <div className="changepassword-form-group password-group">
                                                                <input
                                                                        type={showOld ? "text" : "password"}
                                                                        placeholder="Old Password"
                                                                        value={oldPassword}
                                                                        onChange={(e) => setOldPassword(e.target.value)}
                                                                // required
                                                                />
                                                                <span
                                                                        className="material-symbols-outlined visibility-icon"
                                                                        onClick={() => setShowOld((prev) => !prev)}
                                                                >
                                                                        {showOld ? "visibility_off" : "visibility"}
                                                                </span>
                                                        </div>

                                                        <div className="changepassword-form-group password-group">
                                                                <input
                                                                        type={showNew ? "text" : "password"}
                                                                        placeholder="New Password"
                                                                        value={newPassword}
                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                // required
                                                                />
                                                                <span
                                                                        className="material-symbols-outlined visibility-icon"
                                                                        onClick={() => setShowNew((prev) => !prev)}
                                                                >
                                                                        {showNew ? "visibility_off" : "visibility"}
                                                                </span>
                                                        </div>

                                                        <div className="changepassword-form-group password-group">
                                                                <input
                                                                        type={showCnf ? "text" : "password"}
                                                                        placeholder="Confirm New Password"
                                                                        value={confirmPassword}
                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                // required
                                                                />
                                                                <span
                                                                        className="material-symbols-outlined visibility-icon"
                                                                        onClick={() => setShowCnf((prev) => !prev)}
                                                                >
                                                                        {showCnf ? "visibility_off" : "visibility"}
                                                                </span>
                                                        </div>

                                                        <button className="changepassword-button" type="submit" disabled={loading}>
                                                                {loading ? "Changing..." : "Change Password"}
                                                        </button>
                                                </form>
                                        </div>
                                </div>
                        </div>
                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}
                </>
        );
}
