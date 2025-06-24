import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css'; 

import _Config from '../Config.js';
const Config = new _Config();
const navcafeimg = Config.moonlightcafelogo

// Helper to get cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    setMenuOpen(false);
    setShowPopup(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleLoginIconClick = (e) => {
    e.preventDefault();
    const customerData = getCookie('customerdata');
    if (customerData) {
      // Toggle popup but DO NOT close the menu here
      setShowPopup(!showPopup);
    } else {
      // If not logged in, close menu and navigate to login
      setMenuOpen(false);
      navigate('/login');
    }
  };

  let userId = null;
  try {
    const customerData = getCookie('customerdata');
    if (customerData) {
      const parsed = JSON.parse(decodeURIComponent(customerData));
      userId = parsed._id || null;
    }
  } catch {
    userId = null;
  }

  const handleProfileClick = () => {
    setShowPopup(false);
    if (userId) {
      navigate(`/user/profile/${userId}`);
    } else {
      navigate('/login');
    }
    setMenuOpen(false); // close menu when navigating away
  };

  const handleLogoutClick = () => {
    setShowPopup(false);
    if (userId) {
      navigate(`/user/logout/${userId}`);
    } else {
      navigate('/home');
    }
    setMenuOpen(false); // close menu when navigating away
  };

  return (
    <div className="navbarcontainer" style={{ position: 'relative' }}>
      <img src={navcafeimg} alt="Moonlight Cafe" className="navbarimg" />

      {/* Menu button */}
      <div className="menu-icon" onClick={toggleMenu}>
        {menuOpen ? (
          <i
            className="fa-solid fa-xmark fa-xl"
            style={{ color: '#47d9a8', marginTop: '10px', marginRight: '20px' }}
          ></i>
        ) : (
          <i
            className="fa-solid fa-bars fa-xl"
            style={{ color: '#47d9a8', marginTop: '10px', marginRight: '20px' }}
          ></i>
        )}
      </div>

      {/* Navigation links */}
      <nav className={`navlinks ${menuOpen ? 'open' : 'close'}`}>
        <a href="/home" className="navlink" onClick={(e) => handleNavClick(e, '/home')}>
          Home
        </a>
        <a href="/aboutus" className="navlink" onClick={(e) => handleNavClick(e, '/aboutus')}>
          About
        </a>
        <a href="/services" className="navlink" onClick={(e) => handleNavClick(e, '/services')}>
          Services
        </a>
        <a
          href="/contact_us"
          className="navlink"
          style={{ marginRight: '20px' }}
          onClick={(e) => handleNavClick(e, '/contact_us')}
        >
          Contact Us
        </a>

        {/* Login/Profile icon */}
        <a href="/login" className="navlink-icon" onClick={handleLoginIconClick} style={{ position: 'relative' }}>
          <span className="material-symbols-outlined white-icon">account_circle</span>

          {/* Popup box */}
          {showPopup && (
            <div ref={popupRef} className="profile-popup">
              <button onClick={handleProfileClick} className="popup-btn profile-btn">
                <span className="material-symbols-outlined">person</span>
                <span className="popup-text">Profile</span>
              </button>
              <button onClick={handleLogoutClick} className="popup-btn logout-btn">
                <span className="material-symbols-outlined">logout</span>
                <span className="popup-text">Logout</span>
              </button>
            </div>
          )}

        </a>

      </nav>
    </div>
  );
}
