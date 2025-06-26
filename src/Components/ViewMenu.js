import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import "./ViewMenu.css";
import { useNavigate } from 'react-router-dom';
import _Config from '../Config.js';
import Navbar from './Navbar.js';

const Config = new _Config();
const backendurl = Config.backendurl;

export default function ViewMenu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchData = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          axios.post(`${backendurl}category`, { isactive: 1 }),
          axios.post(`${backendurl}fooditems`, { isactive: 1 }),
        ]);

        setCategories(catRes.data.data || []);
        setFoodItems(foodRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const returnHome = () => {
    navigate('/home');
  };

  const filteredFoodItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.categorycode === selectedCategory;

    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categoriesToShow =
    selectedCategory === "All"
      ? categories
      : categories.filter((cat) => cat.code === selectedCategory);

  return (
    <>
      <Navbar />
      <div className="viewmenu-container">
        <header className="menu-header">
          <h2>Our Menu</h2>
          <p>Explore our delicious offerings crafted with care.</p>
        </header>

        <div className="menu-content">
          <nav className="category-list">
            <button
              className={`category-button ${selectedCategory === "All" ? "active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`category-button ${selectedCategory === cat.code ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.code)}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>

            <input
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              maxLength={50}
            />

            {searchQuery && (
              <span
                className="material-symbols-outlined close-icon"
                onClick={() => setSearchQuery("")}
                style={{ cursor: "pointer" }}
              >
                close
              </span>
            )}
          </div>

          <section className="menu-section">
            {categoriesToShow.map((cat) => {
              const itemsInCategory = filteredFoodItems.filter(
                (item) => item.categorycode === cat.code
              );

              if (itemsInCategory.length === 0) return null;

              return (
                <div key={cat._id} className="category-section" data-aos="fade-up">
                  <h3 className="category-heading">{cat.name}</h3>
                  <div className="menu-grid">
                    {itemsInCategory.map((item) => (
                      <div className="menu-card-wrapper" key={item._id}>
                        <div
                          className="menu-card"
                          data-aos="zoom-in"
                          data-aos-delay="200"
                          data-aos-duration="800"
                        >
                          <img src={item.url} alt={item.name} className="card-image" />
                          <div className="card-content">
                            <h4 className="card-title">{item.name}</h4>
                            <p className="card-description">{item.description}</p>
                            <span className="card-price">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredFoodItems.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "2rem",
                  fontSize: "30px",
                  color: "red",
                }}
              >
                No items found!
              </p>
            )}

            <div className="button-wrapper">
              <button
                type="button"
                className="mainbth home-button-animate"
                onClick={returnHome}
              >
                Home
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}