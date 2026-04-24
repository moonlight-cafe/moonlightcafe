import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useState } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";

const Config = SharedConfig;
const Methods = SharedMethod;
const APIs = SharedAPI;

export default function Home() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDineInClick = () => navigate("/dine-in/select-table");

    const handleTakeAway = async () => {
        const tableCookie = Methods.getCookie("customerdata");
        if (!tableCookie) return navigate("/login");

        const takeawayCookie = Methods.getCookie("takeaway");
        if (takeawayCookie) {
            return navigate(`/take-away/menu/${takeawayCookie.redirecturl}`);
        }

        try {
            const dataObj = tableCookie;
            const res = await APIs.TakeAway(dataObj._id, dataObj.name, dataObj.email, dataObj.contact)
            if (res.redirecturl) {
                Methods.setCookie("takeaway", { redirecturl: res.redirecturl }, 45);
                navigate(`/take-away/menu/${res.redirecturl}`);
            }
        } catch (err) {
            console.error("TakeAway Error:", err);
        }
    };

    const handleDelevery = () => navigate("/delevery");
    const handleReservation = () => navigate("/reservation");

    return (
        <div className="home-wrapper user-not-select">
            <Navbar />

            {/* HERO SECTION */}
            <section className="hero">
                <div className="hero-content">
                    <div className="brand-home">
                        <img src={Config.moonlightcafelogosquare} alt="Logo" className="hero-logo-square" />
                        <img src={Config.moonlightcafetext} alt="Logo" className="hero-logo-text" />
                    </div>
                </div>
            </section>



            {/* FEATURED MENU BANNER */}
            <section className="menu-feature-section">
                <Link to="/view-menu" className="menu-feature-banner" aria-label="View the full menu">
                    <div className="mfb-compact-icon" aria-hidden="true">
                        <span className="material-symbols-outlined">restaurant_menu</span>
                    </div>

                    <div className="mfb-compact-text">
                        <div className="mfb-compact-title">View Menu</div>
                        <div className="mfb-compact-sub">Coffee • Meals • Desserts • Drinks</div>
                    </div>

                    <div className="mfb-compact-action">
                        <span className="material-symbols-outlined mfb-compact-arrow">arrow_forward</span>
                    </div>
                </Link>
            </section>

            {/* QUICK SERVICES SECTION */}
            <section className="services-container">
                <h2 className="services-title">
                    <span className="material-symbols-outlined">room_service</span>
                    Our Services
                </h2>
                <div className="services-grid">
                    <div className="service-card" onClick={handleDineInClick}>
                        <div className="service-icon">
                            <span className="material-symbols-outlined">restaurant</span>
                        </div>
                        <h3>Dine In</h3>
                        <p>Enjoy meals in our cozy ambiance.</p>
                    </div>

                    <div className="service-card" onClick={handleTakeAway}>
                        <div className="service-icon">
                            <span className="material-symbols-outlined">shopping_bag</span>
                        </div>
                        <h3>Take Away</h3>
                        <p>Quick food on the go.</p>
                    </div>

                    <div className="service-card" onClick={handleDelevery}>
                        <div className="service-icon">
                            <span className="material-symbols-outlined">delivery_dining</span>
                        </div>
                        <h3>Delivery</h3>
                        <p>Freshly delivered to your door.</p>
                    </div>

                    <div className="service-card" onClick={handleReservation}>
                        <div className="service-icon">
                            <span className="material-symbols-outlined">event_seat</span>
                        </div>
                        <h3>Reserve Table</h3>
                        <p>Book your favorite spot.</p>
                    </div>
                </div>
            </section>

            {/* CLOCK */}
            <div className="clock-box glass-effect">
                <span className="material-symbols-outlined">schedule</span>
                <span className="clock-time">{Methods.formatDateTime(currentTime)}</span>
            </div>
        </div>
    );
}
