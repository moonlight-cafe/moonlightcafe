import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Service.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AOS from 'aos';
import 'aos/dist/aos.css';

import _Config from '../Config.js';
import _Methods from '../Methods.js';
const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl

const Service = () => {
  const [services, setServices] = useState([]);  // <-- services state declared here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
    });

    const fetchServices = async () => {
      try {
        const response = await axios.post(`${backendurl}services`);
        setServices(response.data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // returnHome function declared here
  const returnHome = () => {
    navigate('/home');
  };

  // if (true) {
  if (loading) {
    return (
      <div className="full-height-page">
        <Navbar />
        <div className="loading-service">
          {Methods.showLoader()}
        </div>
      </div>
    );
  }
  // if (true) {
  if (error) {
    alert('Network Connection!');
    return (
      <div className="full-height-page">
        <div className='ServicesFetchError'>
          {Methods.showLoader()}
          <button type="button" className="mainbth" style={{ marginTop: '50px' }} onClick={returnHome}>Go to Home</button>
        </div>
      </div>
    );
  }


  return (
    <>
      <Navbar />
      <div className="service-container">
        <div className="service-card1" style={{ marginBottom: '15px' }} data-aos="fade-up">
          <h1 className='service-header'>MoonLight Café Services</h1>
        </div>

        <div className="service-list">
          {services.data.map(service => (
            <div key={service.id} className="service-card" data-aos="fade-up" data-aos-delay="100">
              <h2>{service.name}</h2>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
        <br /><br />
        <button type="button" className="mainbth" onClick={returnHome}>Home</button>
      </div>
    </>
  );
};

export default Service;
