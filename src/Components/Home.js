import React from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './Navbar.js';

import _Config from '../Config.js';
import _Methods from '../Methods.js';

const Methods = new _Methods();
const Config = new _Config();
const backendurl = Config.backendurl;

export default function Home() {
  const navigate = useNavigate();

  const handleViewMenuClick = () => navigate('/view-menu');

  const handleDineInClick = () => {
    // const checkLogin = Methods.checkLoginStatus();
    // if (checkLogin.status === 200) {
    //   const checkTable = Methods.checkSelectedTable();
    //   if (checkTable.status === 200) {
    // navigate(`/dine-in/menu/${checkTable.data.redirecturl}`);
    //   } else {
    navigate("/dine-in/select-table");
    //   }
    // } else {
    //   localStorage.setItem("redirectAfterLogin", window.location.pathname);
    //   navigate("/login");
    // }
  };

  const handleTakeAway = async () => {
    const tableCookie = Cookies.get('customerdata');
    if (tableCookie) {
      const takeawayCookie = Cookies.get('takeaway');

      if (takeawayCookie) {
        const takeawayData = JSON.parse(takeawayCookie);
        navigate(`/take-away/menu/${takeawayData.redirecturl}`);
      } else {
        try {
          const customerData = JSON.parse(tableCookie);
          const response = await fetch(`${backendurl}takeawayurl`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              _id: customerData._id,
              name: customerData.name,
              email: customerData.email,
              contact: customerData.contact,
            }),
          });

          const data = await response.json();

          if (response.ok && data.redirecturl) {
            Cookies.set('takeaway', JSON.stringify({ redirecturl: data.redirecturl }), { expires: 1 / 12 });
            navigate(`/take-away/menu/${data.redirecturl}`);
          } else {
            console.error("Redirect URL not received or API error", data);
          }
        } catch (error) {
          console.error("TakeAway fetch error:", error);
        }
      }
    } else {
      navigate('/login');
    }
  };

  const handleDelevery = () => navigate('/delevery');

  return (
    <div className='home-container'>
      <Navbar />
      <h2 className="home-heading">MoonLight Cafe</h2>
      <p className="home-description">Here you can experience the perfect blend of comfort and flavor. Try our delicious coffee and fresh snacks in a warm, inviting space. Relax and make each visit special.</p>
      <p className="home-subdescription">Please choose one of the following options</p>
      <div className='home-button-container'>
        <button className="home-button" onClick={handleDineInClick}>Dine in</button>
        <button className="home-button" onClick={handleTakeAway}>Take Away</button>
        <button className="home-button" onClick={handleDelevery}>Delivery</button>
        <button className="home-button" onClick={handleViewMenuClick}>View Menu</button>
      </div>
    </div>
  );
}
