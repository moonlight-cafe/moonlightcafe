import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useState, useRef, useEffect } from "react";
import "./ContactUs.css";
import Navbar from "./Navbar";

const method = SharedMethod;
const APIs = SharedAPI;

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    contact: "",
  });

  const [tagline, setTagline] = useState("");
  const [typedText, setTypedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);

  // ✅ Tagline Logic
  useEffect(() => {
    let previous = "";
    const cleanGujarati = (text) => {
      if (!text) return "";
      return text.replace(/[^\u0A80-\u0AFF\s]/g, "").replace(/\s+/g, " ").trim();
    };

    const fetchTagline = async () => {
      const prompt = `Give exactly one short tagline for a café Contact Us page. Warm, welcoming, friendly. Gujarati only. No bold.`;
      const result = await APIs.FetchTagLine(prompt);
      if (result?.tagline) {
        const cleaned = cleanGujarati(result.tagline);
        if (cleaned && cleaned !== previous) {
          previous = cleaned;
          setTagline(cleaned);
        }
      }
    };

    fetchTagline();
    const interval = setInterval(fetchTagline, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Typing Effect
  useEffect(() => {
    if (!tagline) {
      setTypedText("");
      return;
    }
    let idx = 0;
    setTypedText("");
    const typer = () => {
      idx += 1;
      setTypedText(tagline.slice(0, idx));
      if (idx < tagline.length) setTimeout(typer, 60);
    };
    typer();
  }, [tagline]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await APIs.CustomerSupportAdd(formData.name, formData.message, formData.email, formData.contact);
      if (response && response.status === 200) {
        method.showPopup(setPopup, popupTimer, response.message || "Message Sent!", "success");
        setFormData({ name: "", email: "", message: "", contact: "" });
      } else {
        method.showPopup(setPopup, popupTimer, response.message || "Failed to send", "error");
      }
    } catch (err) {
      method.showPopup(setPopup, popupTimer, "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper user-not-select">
      <Navbar />

      <div className="contact-main-container">

        {/* LEFT SIDE: INFO */}
        <div className="contact-info-panel">
          <span className="contact-badge">Contact Us</span>
          <h1 className="contact-title">Let's start a conversation.</h1>
          <p className="contact-subtitle">{typedText}<span className="typing-cursor"></span></p>

          <div className="contact-methods-grid">
            <div className="contact-pill">
              <div className="pill-icon"><span className="material-symbols-outlined">call</span></div>
              <div className="pill-text">
                <span>Call Us</span>
                <strong>+91 83203 24195</strong>
              </div>
            </div>
            <div className="contact-pill">
              <div className="pill-icon"><span className="material-symbols-outlined">mail</span></div>
              <div className="pill-text">
                <span>Email Us</span>
                <strong>mithaiwalajainil@gmail.com</strong>
              </div>
            </div>
            <div className="contact-pill">
              <div className="pill-icon"><span className="material-symbols-outlined">location_on</span></div>
              <div className="pill-text">
                <span>Visit Us</span>
                <strong>B-102, Moonlight Street, Surat</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-panel">
          <div className="glass-form-card">
            <form onSubmit={handleSubmit} className="premium-contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="main-color fs-18">Name</label>
                  <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="main-color fs-18">Contact</label>
                  <input type="text" name="contact" placeholder="Your phone" value={formData.contact} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="main-color fs-18">Email Address</label>
                <input type="email" name="email" placeholder="Your work email" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="main-color fs-18">How can we help?</label>
                <textarea name="message" placeholder="Tell us about your inquiry..." value={formData.message} onChange={handleChange} required></textarea>
              </div>

              <div className="flex-center">
                <button type="submit" className="main-btn fs-20 plr-40" disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {method.renderPopup(popup, () => method.hidePopup(setPopup, popupTimer))}
    </div>
  );
}
