import React, { useState, useRef, useEffect } from "react";
import "./ContactUs.css";
import Navbar from "./Navbar";
import AOS from "aos";
import "aos/dist/aos.css";
import _Config from "../Config.js";
const Config = new _Config();
const backendurl = Config.backendurl;

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    contact: "",
  });

  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      offset: 120,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendurl}add/contactus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 200) {
        setPopup({ message: data.message, type: "success", visible: true });
        setFormData({ name: "", email: "", message: "", contact: "" });
      } else {
        setPopup({
          message: data.message || "Something went wrong",
          type: "error",
          visible: true,
        });
      }

      if (popupTimer.current) clearTimeout(popupTimer.current);
      popupTimer.current = setTimeout(() => {
        setPopup((prev) => ({ ...prev, visible: false }));
      }, 10000);
    } catch (error) {
      setPopup({ message: "Error submitting form", type: "error", visible: true });

      if (popupTimer.current) clearTimeout(popupTimer.current);
      popupTimer.current = setTimeout(() => {
        setPopup((prev) => ({ ...prev, visible: false }));
      }, 10000);
    }
  };

  return (
    <div className="contactus-container" data-aos="fade">
      <Navbar />
      <div className="contactus-form-container" data-aos="fade-up">
        <h2 className="contactus-heading">Contact Us</h2>
        <p className="contactus-description">
          We'd love to hear from you! Please fill out the form below with any questions or comments.
        </p>
        <form className="contactus-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            className="contactus-input"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            className="contactus-input"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contact"
            className="contactus-input"
            placeholder="Your Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
          />
          <textarea
            name="message"
            className="contactus-textarea"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="contactus-button">Send Message</button>
        </form>
      </div>
      {popup.visible && (
        <div className={`contactus-popup ${popup.type}`}>
          {popup.message}
          <span
            className="contactus-close-icon material-symbols-outlined"
            onClick={() => setPopup({ ...popup, visible: false })}
          >
            close
          </span>
        </div>
      )}
    </div>
  );
}
