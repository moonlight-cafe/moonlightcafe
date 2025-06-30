import React from 'react';
import './Delivery.css';
import { useNavigate } from "react-router-dom";
import Navbar from './Navbar';

import _Config from '../Config.js';
import _Methods from '../Methods.js';
const Config = new _Config();
const Methods = new _Methods();
const navcafeimg = Config.moonlightcafelogo

export default function Delivery() {
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
                                <button type="button" className="aboutus-mainbth" onClick={handleHomeClick}>
                                        Back to Home
                                </button>
                        </div>
                </div>
        );
}
