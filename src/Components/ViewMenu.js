import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
// import "./ViewMenu.css";
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.js';

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function ViewMenu() {
  const customerdata = Methods.checkLoginStatus();
  const tabledata = Methods.checkSelectedTable();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [aiTagline, setAiTagline] = useState("");
  const [displayedTagline, setDisplayedTagline] = useState("");


  useEffect(() => {
    let previousTagline = "";
    let intervalId;

    const cleanGujarati = (text) => {
      if (!text) return "ઘર જેવો સ્વાદ, મમ્મી નો ટિફિન.";

      return text
        .replace(/\([^)]*\)/g, "")
        .replace(/[A-Za-z]/g, "")
        .replace(/[\*\_]/g, "")
        .replace(/[^\u0A80-\u0AFF\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const fetchTagline = async () => {
      const prompt = `
      Give exactly one short Gujarati food tagline for a restaurant menu.
      Rules:
      - Only Indian Food
      - Best Gujarati/Panjabi/Kathiyavadi
      - Only one line
      - Must relate to delicious food or menu variety
      - No translation
      - No explanation
      - No brackets or English words
      - No bold or symbols
      - No newline
      `;

      const result = await BackendApis.FetchTagLine(prompt);

      const cleaned = cleanGujarati(result?.tagline);

      if (cleaned && cleaned !== previousTagline) {
        previousTagline = cleaned;
        setAiTagline(cleaned);
      }
    };

    fetchTagline();
    intervalId = setInterval(fetchTagline, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!aiTagline) return;

    let index = 0;
    setDisplayedTagline("");

    const speed = 60;
    let timer;

    const type = () => {
      index++;
      setDisplayedTagline(aiTagline.slice(0, index));
      if (index < aiTagline.length) {
        timer = setTimeout(type, speed);
      }
    };

    timer = setTimeout(type, speed);

    return () => clearTimeout(timer);
  }, [aiTagline]);

  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);

  const navigate = useNavigate();

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type);
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchData = async () => {
      try {
        let favoriteItemsRes = null;

        const [catRes, foodRes] = await Promise.all([
          BackendApis.FetchCategories(),
          BackendApis.FetchFoodItems(),
        ]);

        if (customerdata.status === 200) {
          favoriteItemsRes = await BackendApis.FetchFavItems(customerdata.data._id)
          if (favoriteItemsRes.data.status === 200) {
            const favIds = favoriteItemsRes.data.data.map((fav) => fav._id);
            setFavoriteIds(favIds);
          }
        }

        setCategories(catRes.data || []);
        setFoodItems(foodRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        showPopup("Failed to load menu. Please check your connection.");
        setLoading(false);
        setError(err);
      }
    };

    fetchData();
  }, []);

  const returnHome = () => navigate('/home');

  const handleToggleFavorite = async (item) => {
    if (customerdata.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    const customerId = customerdata.data._id;

    if (favoriteIds.includes(item._id)) {
      try {
        const response = await BackendApis.RemoveFavItems(customerId, item._id, item.name)

        if (response.status === 200) {
          setFavoriteIds((prev) => prev.filter(id => id !== item._id));
          showPopup(response.message, "success");
        } else {
          showPopup("Failed to remove from favorites.");
        }
      } catch (error) {
        console.error("Error removing from favorites:", error);
        showPopup("Something went wrong while removing from favorites.");
      }
    } else {
      try {
        const response = await BackendApis.AddFavItems(customerId, item._id, item.code, item.name)

        if (response.status === 200) {
          setFavoriteIds((prev) => [...prev, item._id]);
          showPopup(response.message, "success");
        } else {
          showPopup("Failed to add to favorites.");
        }
      } catch (error) {
        console.error("Error adding to favorites:", error);
        showPopup("Something went wrong while adding to favorites.");
      }
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className="full-height-page">
          <div className="loading-service">
            {Methods.showLoader()}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="full-height-page">
        <Navbar />
        {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}
        <div className="ServicesFetchError">
          {Methods.showLoader()}
          <button type="button" className="main-btn" style={{ marginTop: "50px" }} onClick={returnHome}>Home</button>
        </div>
      </div>
    );
  }

  const filteredFoodItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.categorycode === selectedCategory;
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
      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}
      <div className="viewmenu-container user-not-select">
        <header className="menu-header">
          <h2>Our Menu</h2>
          <p className="menu-tagline">
            {displayedTagline}
            <span className="typing-cursor" />
          </p>

        </header>

        <div className="menu-content">
          {/* Categories */}
          <nav className="category-list">
            <button
              className={`main-btn plr-30 ${selectedCategory === "All" ? "active" : ""}`}
              onClick={() => setSelectedCategory("All")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.code}
                className={`main-btn ml-20 plr-20 ${selectedCategory === cat.code ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat.code)}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {/* Search */}
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
                      <div className="menu-card-wrapper" data-aos="zoom-in" data-aos-delay="200" data-aos-duration="800" key={item._id}>
                        <div className="menu-card">
                          <div className="card-image-wrapper">
                            <img src={item.url} alt={item.name} className="card-image" />
                          </div>
                          <div className="card-content p-0">
                            <div className="add-to-cartbtn">
                              <h4 className="card-title">{item.name}</h4>
                              {/*   {Methods.tooltip(
                                item.description,
                                <span className="material-symbols-outlined white ml-5" style={{ zIndex: "100" }}>info</span>
                              )} */}
                            </div> <br />
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
              <p style={{
                textAlign: "center",
                marginTop: "2rem",
                fontSize: "30px",
                color: "red",
              }}>
                No items found!
              </p>
            )}

            <div className="button-wrapper">
              {searchQuery && (
                <button type="button" className="main-btn home-button-animate" onClick={() => setSearchQuery("")}>
                  Clear Search
                </button>
              )}
              <button type="button" className="main-btn home-button-animate" onClick={returnHome}>
                Home
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
