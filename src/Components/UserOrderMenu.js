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
  const popupTimer = useRef(null);
  const navigate = useNavigate();

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type);
  };


  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
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
            const favIds = favRes.data.map((fav) => fav._id);
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

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="full-height-page">
          <div className="loader-wrap">{Methods.showLoader()}</div>
        </div>
      ) : error ? (
        <div className="full-height-page">
          {Methods.showLoader()}
          <button
            type="button"
            className="mainbth"
            style={{ marginTop: "50px" }}
            onClick={returnHome}
          >
            Home
          </button>
        </div>
      ) : (
        <div className="viewmenu-container">
          <header className="menu-header">
            <h2 className="menu-header-h2">Start Your Order</h2>
            <p className="menu-header-p">Choose from our freshly prepared menu items and add to your cart.</p>
          </header>

          <div className="menu-content">
            <nav className="category-list">
              <button
                className={`main-btn plr-30 user-not-select ${selectedCategory === "All" ? "active" : ""}`}
                onClick={() => setSelectedCategory("All")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.code}
                  className={`main-btn ml-20 plr-20 user-not-select ${selectedCategory === cat.code ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.code)}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

            <div className="search-container user-not-select">
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
                  className="material-symbols-outlined search-close-icon"
                  onClick={() => setSearchQuery("")}
                  style={{ cursor: "pointer" }}
                >
                  close
                </span>
              )}
            </div>

            <section className="menu-section">
              {categories
                .filter((cat) => selectedCategory === "All" || cat.code === selectedCategory)
                .map((cat) => {
                  const itemsInCategory = filteredItems.filter(
                    (item) => item.categorycode === cat.code
                  );
                  if (!itemsInCategory.length) return null;

                  return (
                    <div key={cat._id} className="category-section" data-aos="fade-up">
                      <h3 className="category-heading user-not-select">{cat.name}</h3>
                      <div className="menu-grid">
                        {itemsInCategory.map((item) => (
                          <div className="menu-card-wrapper" key={item._id}>
                            <div
                              className="menu-card user-not-select"
                              data-aos="zoom-in"
                              data-aos-delay="200"
                            >
                              <div className="card-image-wrapper">
                                <img src={item.url} alt={item.name} className="card-image" />
                                <button
                                  className={`fav-button-overlay ${favoriteIds.includes(item._id) ? "active" : ""}`}
                                  onClick={() => handleToggleFavorite(item)}
                                  title={favoriteIds.includes(item._id) ? "Remove from Favorite" : "Add to Favorite"}
                                >
                                  <span className="material-symbols-outlined">favorite</span>
                                </button>
                              </div>
                              <div className="card-content">
                                <div className="add-to-cartbtn">
                                  <h4 className="card-title">{item.name}</h4>
                                 {/*  {Methods.tooltip(
                                    item.description,
                                    <span className="material-symbols-outlined white ml-5" style={{ zIndex: "100" }}>info</span>
                                  )} */}
                                </div> <br />
                                <span className="card-price">
                                  ₹{parseFloat(item.price).toFixed(2)}
                                </span>
                                <br />
                                {(addedItems || []).some((i) => i.foodid === item._id) ? (
                                  <button className="main-btn mt-20 user-not-select" disabled>
                                    Item Added
                                  </button>
                                ) : (
                                  <button
                                    className="main-btn fs-15 mt-20 add-to-cartbtn user-not-select"
                                    onClick={() => addToCart(item)}
                                  >
                                    <span className="material-symbols-outlined">add</span>
                                    <span style={{ marginTop: "2.5px" }}>Add to Cart</span>
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
                <>
                  <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "30px", color: "red" }}>
                    No items found!
                  </p>
                  <button
                    type="button"
                    className="main-btn"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear Search
                  </button>
                </>
              )}
            </section>
          </div>

          <div className="order-view-cart-container user-not-select">
            <button className="main-btn add-to-cartbtn blur-5 plr-30 ptb-15" onClick={handleViewCart}>
              <span className="material-symbols-outlined fs-20">shopping_cart</span>
              View Cart
            </button>
          </div>
        </div>
      )}
      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}
    </>
  );
}
