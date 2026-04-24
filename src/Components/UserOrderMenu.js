import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";
import "./UserOrderMenu.css";
import AOS from "aos";
import "aos/dist/aos.css";

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function UserOrderMenu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const customerdata = Methods.checkLoginStatus();
  const tabledata = Methods.checkSelectedTable();
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [animatingItemId, setAnimatingItemId] = useState(null);
  const popupTimer = useRef(null);
  const navigate = useNavigate();

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setHeaderVisible(false); // Scroll Down - Hide
      } else {
        setHeaderVisible(true); // Scroll Up - Show
      }
      if (currentScrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    if (customerdata.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (tabledata.status !== 200) {
      navigate("/dine-in/select-table");
      return;
    }

    const fetchData = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          BackendApis.FetchCategories(),
          BackendApis.FetchFoodItems(),
        ]);

        setCategories(catRes.data || []);
        setFoodItems(foodRes.data || []);

        const cartCookie = Methods.getCookie("addtocart");
        setAddedItems(cartCookie || []);

        const customer = Methods.checkLoginStatus();
        if (customer.status === 200) {
          const favRes = await BackendApis.FetchFavItems(customer.data._id)
          if (favRes.status === 200) {
            const favIds = (favRes.data || []).map((fav) => fav._id);
            setFavoriteIds(favIds);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load menu. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const addToCartWithAnim = (item) => {
    addToCart(item);
    setAnimatingItemId(item._id);
    setTimeout(() => setAnimatingItemId(null), 600);
  };

  const addToCart = (foodItem) => {
    const customerdata = Methods.getCookie("customerdata");
    const tabledata = Methods.getCookie("selectedTable");

    if (!customerdata._id) return navigate("/login");
    if (!tabledata.id) return navigate("/dine-in/select-table");

    const existingItem = addedItems.find((item) => item.foodid === foodItem._id);

    let updatedItems;
    if (existingItem) {
      updatedItems = addedItems.map((item) =>
        item.foodid === foodItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem = {
        foodid: foodItem._id,
        foodcode: foodItem.code,
        foodname: foodItem.name,
        price: foodItem.price,
        quantity: 1,
        imageurl: foodItem.url,
      };
      updatedItems = [...addedItems, newItem];
    }

    setAddedItems(updatedItems);
    Methods.setCookie("addtocart", updatedItems, 30);
  };

  const handleToggleFavorite = async (item) => {
    if (customerdata.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    const customerId = customerdata.data._id;

    if (favoriteIds.includes(item._id)) {
      try {
        const res = await BackendApis.RemoveFavItems(customerId, item._id, item.name)

        if (res.status === 200) {
          setFavoriteIds((prev) => prev.filter((id) => id !== item._id));
          showPopup(res.message, "success");
        }
      } catch (err) {
        console.error("Remove favorite error:", err);
      }
    } else {
      try {
        const res = await BackendApis.AddFavItems(customerId, item._id, item.code, item.name)

        if (res.status === 200) {
          setFavoriteIds((prev) => [...prev, item._id]);
          showPopup(res.message, "success");
        }
      } catch (err) {
        console.error("Add favorite error:", err);
      }
    }
  };

  const returnHome = () => {
    navigate("/home");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCart = () => {
    const selectedTable = Methods.getCookie("selectedTable");
    const tableNo = selectedTable.redirecturl || selectedTable.id || "";
    if (!tableNo) {
      return navigate("/dine-in/select-table");
    }
    navigate(`/view-cart/${tableNo}`);
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.categorycode === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return (
    <div className="full-height-page user-not-select">
      <div className="loader-wrap">
        {Methods.showLoader()}
        <p style={{ color: 'var(--primary)', marginTop: '20px', fontWeight: '800', letterSpacing: '1px' }}>EXPLORING FLAVORS</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="full-height-page user-not-select">
      <div className="no-results-v3">
        <span className="material-symbols-outlined" style={{ color: '#ff4757' }}>cloud_off</span>
        <h2>{error}</h2>
        <button className="main-btn mt-20" onClick={returnHome}>Return Home</button>
      </div>
    </div>
  );

  return (
    <div className="viewmenu-wrapper user-not-select">
      <Navbar />
      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}

      <header className="menu-minimal-header" data-aos="fade-down">
        <h1>Order Menu</h1>
      </header>

      <div className={`nav-sticky-capsule ${headerVisible ? "" : "hidden"}`}>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item);
                        }}
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

                      <div className="card-v3-actions">
                        {(addedItems || []).some((i) => i.foodid === item._id) ? (
                          <div className={`item-added-pill ${animatingItemId === item._id ? "pop-anim" : ""}`}>
                            <span className="material-symbols-outlined">check_circle</span>
                            Added
                          </div>
                        ) : (
                          <button
                            className={`info-btn-v3 ${animatingItemId === item._id ? "pop-anim" : ""}`}
                            onClick={() => addToCartWithAnim(item)}
                          >
                            <span className="material-symbols-outlined">add_shopping_cart</span>
                            Add to Cart
                          </button>
                        )}
                      </div>
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

      <div className="view-cart-fab" data-aos="fade-up">
        <button className="main-btn" onClick={handleViewCart}>
          <span className="material-symbols-outlined">shopping_cart_checkout</span>
          <span className="fab-text">View Cart</span>
        </button>
      </div>

      <button
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <span className="material-symbols-outlined">keyboard_arrow_up</span>
      </button>
    </div>
  );
}

