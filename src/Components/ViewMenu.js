import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ViewMenu.css";
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.js';

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function ViewMenu() {
  const customerdata = Methods.checkLoginStatus();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const fetchData = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          BackendApis.FetchCategories(),
          BackendApis.FetchFoodItems(),
        ]);

        if (customerdata?.status === 200) {
          const favRes = await BackendApis.FetchFavItems(customerdata.data._id);
          if (favRes?.data?.status === 200) {
            setFavoriteIds(favRes.data.data.map((fav) => fav._id));
          }
        }
        setCategories(catRes.data || []);
        setFoodItems(foodRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleFavorite = async (e, item) => {
    e.stopPropagation();
    if (customerdata?.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    const isFav = favoriteIds.includes(item._id);
    try {
      const response = isFav
        ? await BackendApis.RemoveFavItems(customerdata.data._id, item._id, item.name)
        : await BackendApis.AddFavItems(customerdata.data._id, item._id, item.code, item.name);

      if (response.status === 200) {
        setFavoriteIds(prev => isFav ? prev.filter(id => id !== item._id) : [...prev, item._id]);
        Methods.showPopup(setPopup, popupTimer, response.message, "success");
      }
    } catch (err) {
      Methods.showPopup(setPopup, popupTimer, "Action failed", "error");
    }
  };

  const filteredItems = foodItems.filter(item => {
    const matchesCat = selectedCategory === "All" || item.categorycode === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) return (
    <div className="full-height-page user-not-select">
      <div className="loader-wrap">
        {Methods.showLoader()}
        <p style={{ color: 'var(--primary)', marginTop: '20px', fontWeight: '800', letterSpacing: '1px' }}>EXPLORING FLAVORS</p>
      </div>
    </div>
  );

  return (
    <div className="viewmenu-wrapper user-not-select">
      <Navbar />
      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}

      <header className="menu-minimal-header" data-aos="fade-down">
        <h1>Our Menu</h1>
      </header>

      <div className="nav-sticky-capsule">
        <div className="search-field-modern" data-aos="fade-up">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="What are you craving?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-scroll-pill" data-aos="fade-up" data-aos-delay="100">
          <button
            className={`cat-item-btn ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => setSelectedCategory("All")}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat.code}
              className={`cat-item-btn ${selectedCategory === cat.code ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.code)}
            >{cat.name}</button>
          ))}
        </div>
      </div>

      <main className="menu-main-container">
        {categories.filter(c => selectedCategory === "All" || c.code === selectedCategory).map((cat, catIdx) => {
          const items = filteredItems.filter(i => i.categorycode === cat.code);
          if (items.length === 0) return null;

          return (
            <div key={cat._id} className="cat-section" data-aos="fade-up">
              <h2 className="cat-title-glow">{cat.name}</h2>
              <div className="food-glow-grid">
                {items.map((item, idx) => (
                  <div className="food-card-v3" key={item._id} data-aos="zoom-in" data-aos-delay={idx * 50}>
                    <div className="card-v3-img">
                      <img src={item.url} alt={item.name} />
                      <button
                        className={`fav-btn-float ${favoriteIds.includes(item._id) ? 'active' : ''}`}
                        onClick={(e) => handleToggleFavorite(e, item)}
                      >
                        <span className="material-symbols-outlined">
                          {favoriteIds.includes(item._id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>

                    <div className="card-v3-info">
                      <div className="food-info-top">
                        <h4>{item.name}</h4>
                        <span className="food-v3-price">₹{parseFloat(item.price).toFixed(2)}</span>
                      </div>
                      <p className="food-v3-desc">{item.description || "Indulge in our carefully prepared dish, featuring fresh ingredients and signature seasonings."}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="no-results-v3">
            <span className="material-symbols-outlined">restaurant_menu</span>
            <h2>We couldn't find anything matching your search.</h2>
            <button className="main-btn mt-20" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>Reset Selection</button>
          </div>
        )}
      </main>
    </div>
  );
}
