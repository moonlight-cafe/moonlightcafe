import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";


const Config = SharedConfig;
const Methods = SharedMethod;
const APIs = SharedAPI;
const cafeLogo = Config.moonlightcafelogo;

export default function Home() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [aiTagline, setAiTagline] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let previousTagline = "";
    let intervalId;

    const cleanTagline = (text) => {
      if (!text) return "ઘર જેવો સ્વાદ, મમ્મી નો ટિફિન.";

      return text
        .replace(/[^\u0A80-\u0AFF\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const fetchTagline = async () => {
      const prompt = `
        Give exactly one short Gujarati food tagline for "Mummy Nu Tiffin".
        Rules:
        - Only Gujarati
        - Only one line
        - No translation
        - No explanation
        - No brackets or English
        - No bold or symbols
        - No newline
        - Unique
      `;

      const result = await APIs.FetchTagLine(prompt);

      if (result?.tagline) {
        const cleaned = cleanTagline(result.tagline);

        if (cleaned && cleaned !== previousTagline) {
          previousTagline = cleaned;
          setAiTagline(cleaned);
        }
      } else {
        const fallback = "ઘર જેવો સ્વાદ, મમ્મી નું ટિફિન.";
        if (fallback !== previousTagline) {
          previousTagline = fallback;
          setAiTagline(fallback);
        }
      }
    };
    fetchTagline();
    intervalId = setInterval(fetchTagline, 10000);
    return () => clearInterval(intervalId);
  }, []);



  useEffect(() => {
    if (!aiTagline) {
      setDisplayedTagline("");
      return;
    }

    let idx = 0;
    setDisplayedTagline("");
    const typingSpeed = 60;
    let cancelled = false;

    const typer = () => {
      if (cancelled) return;
      idx += 1;
      setDisplayedTagline(aiTagline.slice(0, idx));
      if (idx < aiTagline.length) {
        timer = setTimeout(typer, typingSpeed);
      }
    };

    let timer = setTimeout(typer, typingSpeed);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [aiTagline]);

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day}-${month}-${year} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  const handleViewMenuClick = () => navigate("/view-menu");
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
    <div className="home-wrapper">
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero">
        <img src={cafeLogo} alt="Cafe Logo" className="hero-logo" />
        <br />
        <p className="hero-tagline">
          {displayedTagline}
          <span className="typing-cursor" />
        </p>
      </section>

      {/* ACTION CARDS */}
      <section className="action-grid">
        <div className="action-card" onClick={handleDineInClick}>
          <h3 className="action-card-h3">Dine In</h3>
          <p>Enjoy your meal in our cozy ambience.</p>
        </div>

        <div className="action-card" onClick={handleTakeAway}>
          <h3 className="action-card-h3">Take Away</h3>
          <p>Grab delicious food on the go.</p>
        </div>

        <div className="action-card" onClick={handleDelevery}>
          <h3 className="action-card-h3">Delivery</h3>
          <p>Get your food delivered fresh.</p>
        </div>

        <div className="action-card" onClick={handleReservation}>
          <h3 className="action-card-h3">Reserve a Table</h3>
          <p>Explore our delicious menu items.</p>
        </div>

        <div className="action-card" onClick={handleViewMenuClick}>
          <h3 className="action-card-h3">View Menu</h3>
          <p>Explore our delicious menu items.</p>
        </div>

      </section>

      {/* CLOCK */}
      <div className="clock-box">
        {formatDateTime(currentTime)}
      </div>
    </div>
  );
}
