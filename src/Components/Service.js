import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect } from 'react';
import './Service.css';
import Navbar from './Navbar';

const BackendAPIs = SharedAPI;
const Methods = SharedMethod;
const Config = SharedConfig;

const Service = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await BackendAPIs.Services();
        setServices(response.data || []);
        setLoading(false);
      } catch (err) {
        setError('Error fetching services');
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="service-loader-container">
          {Methods.showLoader()}
        </div>
      </>
    );
  }

  const getServiceIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('dine')) return 'restaurant';
    if (n.includes('take') || n.includes('away')) return 'shopping_bag';
    if (n.includes('delivery')) return 'delivery_dining';
    if (n.includes('reserve') || n.includes('table')) return 'event_seat';
    return 'star';
  };

  return (
    <div className="services-page-wrapper user-not-select">
      <Navbar />

      <header className="services-hero">
        <div className="services-hero-content">
          <span className="services-badge">World Class Services</span>
          <h1 className="services-title">Crafting Your Perfect Experience</h1>
          <p>From cozy dine-ins to speedy deliveries, we ensure every interaction is filled with the magic of Moonlight.</p>
        </div>
      </header>

      <main className="services-grid-section">
        <div className="services-grid-container">
          {services.map((service, index) => (
            <div key={index} className="service-premium-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="service-card-inner">
                <div className="service-icon-box">
                  <span className="material-symbols-outlined">{getServiceIcon(service.name)}</span>
                </div>
                <div className="service-card-content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
              <div className="card-ambient-glow"></div>
            </div>
          ))}
        </div>
      </main>

      <section className="services-feature-callout">
        <div className="feature-callout-inner">
          <div className="feature-text">
            <h2>Looking for something special?</h2>
            <p>Our team is dedicated to making every visit unique. Reach out for custom event bookings or special requests.</p>
            <button className="contact-special-btn" onClick={() => window.location.href = '/contactus'}>Contact for Special Events</button>
          </div>
          <div className="feature-visual">
            <span className="material-symbols-outlined large-symbol">celebration</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;