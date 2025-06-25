import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./UserOrderMenu.css";
import AOS from "aos";
import "aos/dist/aos.css";
import _Config from "../Config.js";
import _Methods from "../Methods.js";

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;

export default function UserOrderMenu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [addedItems, setAddedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCookieJSON = (key) => {
    try {
      return JSON.parse(Cookies.get(key) || "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const loginCheck = Methods.checkLoginStatus();
    const tableCheck = Methods.checkSelectedTable();

    if (loginCheck.status !== 200) {
      navigate("/login");
      return;
    }

    if (tableCheck.status !== 200) {
      navigate("/dine-in/select-table");
      return;
    }

    const fetchData = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          axios.post(`${backendurl}category`, { isactive: 1 }),
          axios.post(`${backendurl}fooditems`, { isactive: 1 }),
        ]);

        setCategories(catRes.data.data || []);
        setFoodItems(foodRes.data.data || []);

        const cartCookie = Cookies.get("addtocart");
        const items = cartCookie ? JSON.parse(cartCookie) : [];
        setAddedItems(items);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const addToCart = (foodItem) => {
    const customerdata = getCookieJSON("customerdata");
    const tabledata = getCookieJSON("selectedTable");

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
    Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 2 / 24 });
  };

  const handleViewCart = () => {
    const tableNo = getCookieJSON("selectedTable").redirecturl || "";
    navigate(`/view-cart/${tableNo}`);
  };

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.categorycode === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="loading-screen">Loading menu...</div>;

  return (
    <div className="viewmenu-container">
      <header className="menu-header">
        <h2 className="menu-header-h2">Our Menu</h2>
        <p className="menu-header-p">Explore our delicious offerings crafted with care.</p>
        <h3 style={{ color: "red" }}>
          Note: Do not close the window. If you close the window, you will not be able to order again.
        </h3>
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
              key={cat.code}
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
              const itemsInCategory = filteredItems.filter((item) => item.categorycode === cat.code);
              if (!itemsInCategory.length) return null;

              return (
                <div key={cat._id} className="category-section" data-aos="fade-up">
                  <h3 className="category-heading">{cat.name}</h3>
                  <div className="menu-grid">
                    {itemsInCategory.map((item) => (
                      <div className="menu-card-wrapper" key={item._id}>
                        <div className="menu-card" data-aos="zoom-in" data-aos-delay="200">
                          <img src={item.url} alt={item.name} className="card-image" />
                          <div className="card-content">
                            <h4 className="card-title">{item.name}</h4>
                            <p className="card-description">{item.description}</p>
                            <span className="card-price">
                              ₹{parseFloat(item.price).toFixed(2)}
                            </span>
                            <br />
                            {addedItems.some((i) => i.foodid === item._id) ? (
                              <button className="item-added-button" disabled>
                                Item Added
                              </button>
                            ) : (
                              <button className="add-to-cart-button" onClick={() => addToCart(item)}>
                                <i className="fa-solid fa-plus fa-lg fa-fade" style={{ marginRight: "5px" }}></i> Add to Cart
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
        </section>
      </div>

      <div className="order-view-cart-container">
        <button className="order-view-cart-button" onClick={handleViewCart}>
          {/* <i className="fa-solid fa-cart-shopping fa-xl"></i> */}
          <i class="fa-solid fa-cart-plus fa-lg"></i>
          {/* <p className="btn-View-cart"> */}
          View Cart
          {/* </p> */}
        </button>
      </div>
    </div>
  );
}
