import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

import _Config from '../Config.js';
const Config = new _Config();
const cafelogo = Config.moonlightcafelogo

function LogOut() {
        const [showSplash, setShowSplash] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
                document.cookie.split(";").forEach(cookie => {
                        const eqPos = cookie.indexOf("=");
                        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                });

                const timeout = setTimeout(() => {
                        setShowSplash(false);
                        navigate("/home");
                }, 6000);

                return () => clearTimeout(timeout);
        }, [navigate]);

        return (
                <div className="splash-screen">
                        {showSplash && (
                                <>
                                        <img src={cafelogo} alt="Moonlight Cafe Logo" className="splash-logo" />
                                        <p className="user-welcome p-10">You have been logged out.</p>
                                        <p className="welcome-message green p-10">Thanks for visiting Moonlight Cafe!</p>
                                        <p className="designer-message green p-10">Redirecting you to home...</p>
                                </>
                        )}
                </div>
        );
}

export default LogOut;
