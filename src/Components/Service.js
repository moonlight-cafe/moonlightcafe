import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useState, useEffect, useRef } from 'react';
import './Service.css';
import Navbar from './Navbar';

const BackendAPIs = SharedAPI;
const Methods = SharedMethod;

const Service = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await BackendAPIs.Services()
        setServices(response);
        setLoading(false);
      } catch (err) {
        setError('Error fetching services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (!services.data) return;

    const elements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
      }
    );

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [services]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="full-height-page">
          <div className="loading-service">
            {Methods.showLoader()}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="full-height-page">
          <div className="ServicesFetchError">
            {Methods.showLoader()}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div ref={scrollRef} className="futuristic-service-container scroll-area">

        <h1 className="futuristic-service-title reveal">
          Our Services
        </h1>

        <div className="futuristic-service-grid" style={{ marginBottom: "2rem" }}>
          {services.data.map((service, index) => (
            <div
              key={service.id}
              className="futuristic-service-card reveal"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <h2>{service.name}</h2>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Service;