import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./UserOrderMenu.css";
import _Config from "../Config.js";

const Config = new _Config();
const backendurl = Config.backendurl;

export default function UserOrderMenu_TakeAway() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [addedItems, setAddedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, foodItemsResponse] = await Promise.all([
          axios.post(`${backendurl}category`, { isactive: 1 }),
          axios.post(`${backendurl}fooditems`, { isactive: 1 }),
        ]);
        setCategories(categoriesResponse.data.data);
        setFoodItems(foodItemsResponse.data.data);
      } catch (err) {
        setError("Error fetching data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      const TakeAwayUserData = JSON.parse(Cookies.get("TakeAwayUserData") || "{}");
      if (!TakeAwayUserData || Object.keys(TakeAwayUserData).length === 0) return;

      try {
        const response = await axios.get(
          `https://moonlight-cafe-add-to-cart.onrender.com/view-cart/${TakeAwayUserData.randomString}`
        );
        const itemsInCart = new Set(response.data.map((item) => item.food_id));
        setAddedItems(itemsInCart);
      } catch (err) {
        console.error("Error fetching cart items:", err);
      }
    };
    fetchCartItems();
  }, []);

  const addToCart = async (foodItem) => {
    const TakeAwayUserData = JSON.parse(Cookies.get("TakeAwayUserData") || "{}");
    if (!TakeAwayUserData || Object.keys(TakeAwayUserData).length === 0) return;

    const currentTime = new Date().toISOString();

    try {
      await axios.post("http://localhost:5000/add-to-cart", {
        name: TakeAwayUserData.name,
        email: TakeAwayUserData.email,
        order_id: TakeAwayUserData.order_id,
        food_id: foodItem._id,
        price: foodItem.price,
        created_at: currentTime,
        quantity: 1,
      });

      setAddedItems((prev) => {
        const updated = new Set(prev).add(foodItem._id);
        Cookies.set("addtocart", JSON.stringify(Array.from(updated)), { expires: 1 });
        return updated;
      });
    } catch (err) {
      console.error("Error adding item to cart:", err);
    }
  };

  const handleViewCart = () => {
    const TakeAwayUserData = JSON.parse(Cookies.get("TakeAwayUserData") || "{}");
    const order_id = TakeAwayUserData.order_id || "";
    navigate(`/take-away/view-cart/${order_id}`);
  };

  const filteredFoodItems = useMemo(() => {
    if (selectedCategory === "All") return foodItems;
    const selectedCatCode = categories.find((cat) => cat.name === selectedCategory)?.code;
    return foodItems.filter((item) => item.categorycode === selectedCatCode);
  }, [selectedCategory, foodItems, categories]);

  if (loading) return <div className="viewmenu-container"><div className="menu-header-h2">Loading...</div></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="viewmenu-container">
      <header className="menu-header">
        <h2 className="menu-header-h2">Our Menu</h2>
        <p className="menu-header-p">Explore our delicious offerings crafted with care.</p>
        <h3 style={{ color: "red" }}>
          Note: Do not close the window. If you close the window, you will not be able to order the food again.
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
              key={cat._id}
              className={`category-button ${selectedCategory === cat.name ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </nav>
        <section className="menu-section">
          {categories.map((cat) => {
            const categoryItems = filteredFoodItems.filter(
              (item) => item.categorycode === cat.code
            );
            return (
              categoryItems.length > 0 && (
                <div key={cat._id} className="category-section">
                  <h3 className="category-heading">{cat.name}</h3>
                  <div className="menu-grid">
                    {categoryItems.map((item) => (
                      <div key={item._id} className="menu-card">
                        <img src={item.url} alt={item.name} className="card-image" />
                        <div className="card-content">
                          <h4 className="card-title">{item.name}</h4>
                          <p className="card-description">{item.description}</p>
                          <p className="card-price">{parseFloat(item.price).toFixed(2)} ₹/Rs</p>
                          {addedItems.has(item._id) ? (
                            <button className="item-added-button" disabled>
                              Item Added
                            </button>
                          ) : (
                            <button className="add-to-cart-button" onClick={() => addToCart(item)}>
                              <i className="fa-solid fa-plus fa-fade fa-l" style={{ marginRight: "3px" }}></i>
                              Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            );
          })}
        </section>
      </div>
      <div className="order-view-cart-container">
        <button className="order-view-cart-button" onClick={handleViewCart}>
          <i className="fa-solid fa-cart-shopping fa-xl"></i>
          <p className="btn-View-cart"> View Cart</p>
        </button>
      </div>
    </div>
  );
}
