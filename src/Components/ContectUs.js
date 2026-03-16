import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useState, useRef, useEffect } from "react";
import "./ContactUs.css";
import Navbar from "./Navbar";
import AOS from "aos";
import "aos/dist/aos.css";


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

  // ✅ Fetch Tagline every 10 sec
  useEffect(() => {
    let previous = "";
    let interval;

    const cleanGujarati = (text) => {
      if (!text) return "";
      return text
        .replace(/[^\u0A80-\u0AFF\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const fetchTagline = async () => {
      const prompt = `
        Give exactly one short tagline for a café Contact Us page.
        Rules:
        - Only one line
        - Warm, welcoming and friendly
        - No translation
        - No explanation
        - No brackets or English
        - No bold or symbols
        - No newline
      `;

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
    interval = setInterval(fetchTagline, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!tagline) {
      setTypedText("");
      return;
    }

    let idx = 0;
    let timer = null;
    const typingSpeed = 60;
    setTypedText("");

    const typer = () => {
      idx += 1;
      setTypedText(tagline.slice(0, idx));

      if (idx < tagline.length) {
        timer = setTimeout(typer, typingSpeed);
      }
    };

    timer = setTimeout(typer, typingSpeed);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tagline]);

  // ✅ Form submit logic remains same
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

    // Destructure form data
    const { name, email, message, contact } = formData;

    try {
      // Call backend API
      const response = await APIs.CustomerSupportAdd(name, message, email, contact);

      if (response && response.status === 200) {
        method.showPopup(setPopup, popupTimer, response.message ||"dashuhbasu", "success");
        setFormData({ name: "", email: "", message: "", contact: "" });
      } else {
        // Show error popup if backend fails
        method.showPopup(setPopup, popupTimer, response.message || "Something went wrong!", "error");
      }
    } catch (err) {
      console.error("API Error:", err);
      method.showPopup(setPopup, popupTimer, "Something went wrong!", "error");
    }
  };

  return (
    <div className="contactus-container" data-aos="fade">
      <Navbar />
      <div className="contactus-form-container" data-aos="fade-up">
        <h2 className="contactus-heading">Contact Us</h2>
        <p className="contactus-description">
          {typedText}
          <span className="typing-cursor" />
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
          <button type="submit" className="contactus-button">
            Send Message
          </button>
        </form>
      </div>
      {method.renderPopup(popup, () => method.hidePopup(setPopup, popupTimer))}
    </div>
  );
}
