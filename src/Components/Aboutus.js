import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useState } from "react";
import "./Aboutus.css";
import Navbar from "./Navbar";

const Methods = SharedMethod;
const APIs = SharedAPI;
const Config = SharedConfig;

const AboutPage = () => {
  const [aboutData, setAboutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const result = await APIs.FetchAboutUsData();
      if (result?.status === 200) {
        setAboutData(result.data || []);
      } else {
        setError(result?.message || "Error fetching about us data");
      }
      setLoading(false);
    };
    getData();
  }, []);

  const heroItem = aboutData.find((s) => typeof s.body === "string") || aboutData[0] || null;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="about-loading-container">
          <div className="loader-wrapper">{Methods.showLoader()}</div>
        </div>
      </>
    );
  }

  return (
    <div className="about-page-wrapper user-not-select">
      <Navbar />

      {/* HERO SECTION */}
      <header className="about-hero">
        <div className="about-hero-content">
          <div className="about-badge">Our Story</div>
          <h1 className="about-main-title">{heroItem?.title || "MoonLight Café"}</h1>
          <p className="about-description">
            {heroItem?.body || "A cozy corner for great coffee, warm vibes, and delicious treats — crafted with love since 2010."}
          </p>
          <div className="about-hero-btns">
            <button className="about-primary-btn" onClick={() => document.getElementById('story-content').scrollIntoView({ behavior: 'smooth' })}>
              Read Journey
              <span className="material-symbols-outlined">expand_more</span>
            </button>
            <button className="about-outline-btn" onClick={() => window.location.href = "/view-menu"}>
              Discover Flavors
            </button>
          </div>
        </div>
        <div className="about-hero-visual">
          <img src={Config.moonlightcafelogosquare} alt="Logo" className="about-floating-logo" />
        </div>
      </header>

      {/* CONTENT SECTIONS */}
      <section id="story-content" className="about-sections-container">
        {aboutData.filter(s => s !== heroItem).map((section, idx) => {
          const isArray = Array.isArray(section.body);
          return (
            <div key={idx} className={`about-info-block ${idx % 2 === 0 ? 'row' : 'row-reverse'}`}>
              <div className="info-text-side">
                <span className="section-index">0{idx + 1}</span>
                <h2 className="info-heading">{section.title}</h2>
                {!isArray ? (
                  <p className="info-body-text">{section.body}</p>
                ) : (
                  <div className="features-grid">
                    {section.body.map((item, i) => (
                      <div key={i} className="feature-item-pill">
                        {item.icon && <span className="feature-icon">{item.icon}</span>}
                        <div className="feature-meta">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="info-visual-side">
                <div className="visual-glass-card">
                  <span className="material-symbols-outlined luxury-icon">
                    {idx % 2 === 0 ? 'history_edu' : 'verified_user'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* FOOTER CALLOUT */}
      <section className="about-footer-callout">
        <div className="callout-card">
          <h2>Ready to taste the magic?</h2>
          <p>Visit us today for an unforgettable experience.</p>
          <div className="callout-actions">
            <button className="about-primary-btn" onClick={() => window.location.href = "/reservation"}>Book a Table</button>
            <button className="about-outline-btn" onClick={() => window.location.href = "/contactus"}>Talk to Us</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
