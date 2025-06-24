import React, { useEffect } from "react";
import "./Aboutus.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AboutUs() {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 100,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <>
      <Navbar />
      <div className="aboutus-container">
        <section className="aboutus-hero-section" data-aos="fade-up">
          <h2>About MoonLight Cafe</h2>
          <p className="aboutus-hero-description">
            Welcome to MoonLight Cafe, your cozy corner for the best coffee and
            snacks in town. We are a family-owned cafe dedicated to providing a
            relaxing experience with high-quality beverages and delicious
            treats.
          </p>
        </section>

        <section className="aboutus-mission-section" data-aos="fade-right">
          <h3>Our Mission</h3>
          <p>
            At MoonLight Cafe, we pride ourselves on using the finest
            ingredients to craft signature coffee blends, freshly baked pastries,
            and savory snacks. We aim to provide a warm environment where
            everyone can relax, connect, and savor the finest things in life.
          </p>
        </section>

        <section className="aboutus-values-section" data-aos="fade-left">
          <h3>Our Values</h3>
          <div className="aboutus-values-list">
            <div className="aboutus-value-item" data-aos="zoom-in" data-aos-delay="100">
              <span className="aboutus-icon">🌱</span>
              <p>Quality Ingredients</p>
            </div>
            <div className="aboutus-value-item" data-aos="zoom-in" data-aos-delay="200">
              <span className="aboutus-icon">⭐</span>
              <p>Exceptional Customer Service</p>
            </div>
            <div className="aboutus-value-item" data-aos="zoom-in" data-aos-delay="300">
              <span className="aboutus-icon">🛋️</span>
              <p>Comfortable and Inviting Environment</p>
            </div>
            <div className="aboutus-value-item" data-aos="zoom-in" data-aos-delay="400">
              <span className="aboutus-icon">🔄</span>
              <p>Innovation and Exciting New Flavors</p>
            </div>
          </div>
        </section>

        <section className="aboutus-story-section" data-aos="fade-up">
          <h3>Our Story</h3>
          <p>
            Founded in 2010, MoonLight Cafe was born from a simple vision: to
            create a welcoming space for people to enjoy high-quality food and
            beverages. Over the years, we've grown into a beloved community
            destination known for our friendly service and exceptional offerings.
          </p>
        </section>

        <section className="aboutus-locations-section" data-aos="fade-up">
          <h3>Our Locations</h3>
          <p>We are located in two convenient spots to serve you better:</p>
          <ul className="aboutus-location-list">
            <li>
              <strong>Pal, Surat</strong> - 123, Pal Adajan Road, Surat, Gujarat,
              395009
            </li>
            <li>
              <strong>Vesu, Surat</strong> - 456, Vesu Circle, Surat, Gujarat,
              395007
            </li>
          </ul>
        </section>

        <div className="aboutus-btn-container" data-aos="fade-up" data-aos-delay="200">
          <button type="button" className="aboutus-mainbth" onClick={handleHomeClick}>
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
}
