import { Method as SharedMethod } from "../config/Init.js";
import React from 'react';
import './Reservation.css';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

// import _Config from '../Config.js';
// const Config = new _Config();
const Methods = SharedMethod;
// const navcafeimg = Config.moonlightcafelogo

export default function Reservation() {
        const navigate = useNavigate();
        const handleHomeClick = () => {
                navigate("/");
        };
        return (
                <div className='delevery-model'>
                        <Navbar />
                        <div className='delevery-container'>
                                {/* <img src={navcafeimg} alt="Moonlight Cafe" className="splash-logo" /> */}
                                {Methods.showLoader()}
                                {/* <h2>MoonLight Cafe</h2> */}
                                <p className="coming-soon-message">Coming Soon...</p>
                                <button type="button" className="main-btn" onClick={handleHomeClick}>
                                        Back to Home
                                </button>
                        </div>
                </div>
        );
}
