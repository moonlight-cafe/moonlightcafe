import { Config as SharedConfig } from "../config/Init.js";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundPage.css';
import Navbar from "./Navbar.js";

const Config = SharedConfig;

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="notfound-page-container user-not-select">
            <Navbar />

            <div className="notfound-content">
                <div className="notfound-glass-card">
                    <div className="notfound-visual">
                        <h1 className="notfound-404-glow">404</h1>
                        <div className="notfound-portal-ring"></div>
                        <img
                            src={Config.moonlightcafelogosquare}
                            alt="Moonlight Cafe"
                            className="notfound-logo-float"
                        />
                    </div>

                    <div className="notfound-text-zone">
                        <span className="notfound-tag">Lost in the Shadows</span>
                        <h2 className="notfound-title">Page Not Found</h2>
                        <p className="notfound-desc">
                            The culinary masterpiece you're looking for seems to have vanished into the moonlight.
                            Let's get you back to the main menu.
                        </p>

                        <div className="notfound-actions">
                            <button className="main-btn" onClick={() => navigate('/home')}>
                                <span className="material-symbols-outlined">home</span>
                                Return Home
                            </button>
                            <button className="main-btn" onClick={() => navigate(-1)}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="notfound-decoration-orb orb-1"></div>
            <div className="notfound-decoration-orb orb-2"></div>
        </div>
    );
};

export default NotFoundPage;
