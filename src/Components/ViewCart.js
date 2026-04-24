import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ViewCart.css";

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function ViewCart() {
  const customerdata = Methods.checkLoginStatus();
  const tabledata = Methods.checkSelectedTable();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type, 5000);
  };

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

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tableNo = tabledata?.data?.table_no || "N/A";
  const clientName = customerdata?.data?.name || "Customer";
  const clientEmail = customerdata?.data?.email || "";
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const selectedDishes = cartItems.length;

  const calculateTotalPrice = useCallback((items) => {
    const subtotal = items.reduce((acc, item) => acc + Number(item.price), 0);
    setTotalPrice(subtotal);
  }, []);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const savedCart = Methods.getCookie("addtocart");
    if (savedCart && savedCart.length > 0) {
      setCartItems(savedCart);
      setIsCartEmpty(false);
      calculateTotalPrice(savedCart);
    } else {
      setCartItems([]);
      setIsCartEmpty(true);
      setError("Your cart is empty.");
    }
    setLoading(false);
  }, [calculateTotalPrice]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleQuantityChange = async (foodid, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedItems = cartItems.map((item) => {
      if (item.foodid === foodid) {
        const unitPrice = Number(item.unitPrice) || Number(item.price) / Number(item.quantity || 1);
        const newPrice = unitPrice * newQuantity;
        return { ...item, quantity: newQuantity, price: newPrice.toString() };
      }
      return item;
    });

    setCartItems(updatedItems);
    calculateTotalPrice(updatedItems);
    Methods.setCookie("addtocart", updatedItems, 30);
  };

  const handleRemoveItem = async (foodid) => {
    const updatedItems = cartItems.filter((item) => item.foodid !== foodid);
    setCartItems(updatedItems);
    calculateTotalPrice(updatedItems);
    Methods.setCookie("addtocart", updatedItems, 30);

    if (updatedItems.length === 0) {
      setIsCartEmpty(true);
      setError("Your cart is empty.");
    }
  };

  const handleOrderPlaced = async () => {
    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      const cartData = {
        customerid: customerdata.data._id,
        data: cartItems.map((item) => ({
          foodid: item.foodid,
          foodcode: item.foodcode || "",
          foodname: item.foodname || "",
          quantity: item.quantity || 1,
          price: item.price || "0",
          imageurl: item.imageurl || "",
          servicetype: 1
        })),
        totalamount: parseInt(totalPrice),
      };

      const response = await BackendApis.AddtoCart(cartData);

      if (response.status === 200) {
        Methods.deleteCookie("addtocart");
        showPopup("Order placed successfully!", "success");

        setTimeout(() => {
          navigate(`/order/summery/${tabledata.data.id}`);
        }, 1200);
      } else {
        showPopup(response.message || "Failed to place order.", "error");
        setIsPlacingOrder(false);
      }
    } catch (err) {
      showPopup("Something went wrong. Please try again.", "error");
      setIsPlacingOrder(false);
    }
  };

  if (loading) return (
    <div className="full-height-page">
      <div className="loader-wrap">
        {Methods.showLoader()}
        <p className="loading-text">PREPARING YOUR FEAST</p>
      </div>
    </div>
  );

  return (
    <div className="cart-page-wrapper user-not-select">
      <Navbar />
      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}

      <header className="cart-header-v2" data-aos="fade-down">
        <div className="cart-header-main">
          <span className="material-symbols-outlined header-icon">shopping_cart</span>
          <div className="cart-header-copy">
            <span className="cart-header-tag">Dine-In Cart</span>
            <h1>Your Cart</h1>
          </div>
        </div>
        <div className="cart-context-board">
          <div className="context-board-intro">
            <span className="material-symbols-outlined">room_service</span>
            <div>
              <p>Everything for your table is in one place.</p>
              <small>Review dishes, fine-tune quantities, and send the order to the kitchen when you're ready.</small>
            </div>
          </div>

          <div className="context-board-grid">
            <div className="context-detail-card">
              <span className="context-detail-label main-color">Serving Table</span>
              <div className="context-detail-value">
                <span className="material-symbols-outlined">table_restaurant</span>
                <strong>{tableNo}</strong>
              </div>
            </div>

            <div className="context-detail-card">
              <span className="context-detail-label main-color">Customer Name</span>
              <div className="context-detail-value">
                <span className="material-symbols-outlined">person</span>
                <strong>{clientName}</strong>
              </div>
            </div>

            {clientEmail ? (
              <div className="context-detail-card">
                <span className="context-detail-label main-color">Login Email</span>
                <div className="context-detail-value">
                  <span className="material-symbols-outlined">alternate_email</span>
                  <strong>{clientEmail}</strong>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="cart-container-v2">
        {isCartEmpty || cartItems.length === 0 ? (
          <div className="empty-cart-v2" data-aos="zoom-in">
            <span className="material-symbols-outlined">shopping_bag</span>
            <h2>Your cart is empty...</h2>
            <p>Ready to discover some spectacular flavors?</p>
            <button className="main-cancle-btn mt-25" onClick={() => navigate(`/dine-in/menu/${tabledata.data.id}`)}>
              Browse the Menu
            </button><br />
            <button className="main-btn mt-25" onClick={() => {
              setTimeout(() => {
                navigate(`/order/summery/${tabledata.data.id}`);
              }, 1200);
            }}>
              Order History
            </button>
          </div>
        ) : (
          <div className="cart-grid-layout">
            <section className="cart-items-column">
              {cartItems.map((item, idx) => (
                <div key={item.foodid} className="cart-item-modern" data-aos="fade-up" data-aos-delay={idx * 50}>
                  <div className="item-thumb">
                    <img src={item.imageurl} alt={item.foodname} />
                  </div>

                  <div className="item-content">
                    <div className="item-top-row">
                      <h3>{item.foodname}</h3>
                      <button className="delete-icon-btn" onClick={() => handleRemoveItem(item.foodid)}>
                        <span className="material-symbols-outlined">delete_sweep</span>
                      </button>
                    </div>

                    <div className="item-bottom-row">
                      <div className="item-price-glow">₹{parseFloat(item.price).toFixed(2)}</div>
                      <div className="qty-stepper">
                        <button onClick={() => handleQuantityChange(item.foodid, item.quantity - 1)}>
                          <span className="material-symbols-outlined">remove</span>
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button onClick={() => handleQuantityChange(item.foodid, item.quantity + 1)}>
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <aside className="cart-summary-column" data-aos="fade-left">
              <div className="checkout-panel checkout-panel-compact">
                <div className="checkout-compact-header">
                  <div>
                    <span className="checkout-kicker">Order Summary</span>
                  </div>
                </div>

                <div className="checkout-inline-stats">
                  <div className="checkout-inline-stat">
                    <span className="checkout-inline-stat-span main-color">Dishes</span>
                    <span className="checkout-inline-stat-strong">{selectedDishes}</span>
                  </div>
                  <div className="checkout-inline-stat">
                    <span className="checkout-inline-stat-span main-color">Items</span>
                    <span className="checkout-inline-stat-strong">{totalItems}</span>
                  </div>

                  <div className="checkout-inline-stat">
                    <span className="checkout-inline-stat-span main-color">Amount</span>
                    <span className="checkout-inline-stat-strong">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-cta-group">
                  <button
                    className="main-btn width-100 place-order-btn"
                    onClick={handleOrderPlaced}
                    disabled={isPlacingOrder}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                  </button>

                  <div className="summary-footer-actions">
                    <button className="summary-ghost-btn" onClick={() => navigate(`/dine-in/menu/${tabledata.data.id}`)}>
                      <span className="material-symbols-outlined">add</span> Add More
                    </button>
                    <button className="summary-ghost-btn" onClick={() => navigate(`/order/summery/${tabledata.data.id}`)}>
                      <span className="material-symbols-outlined">history</span> History
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

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
