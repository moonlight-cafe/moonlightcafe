import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./ViewCart.css";
import _Config from "../Config.js";
import _Methods from "../Methods.js";

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;

export default function ViewCart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeTip, setIncludeTip] = useState(false);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [customTip, setCustomTip] = useState(0);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const popupTimer = useRef(null);
  const navigate = useNavigate();

  const showPopup = (message, type = "error") => {
    setPopup({ message, type, visible: true });
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => {
      setPopup((prev) => ({ ...prev, visible: false }));
    }, 5000);
  };

  useEffect(() => {
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
  }, [navigate]);

  const tableNo = JSON.parse(Cookies.get("selectedTable") || "{}").table_no;
  const redirecturl = JSON.parse(Cookies.get("selectedTable") || "{}").redirecturl;
  const customerdata = JSON.parse(Cookies.get("customerdata") || "{}");
  const clientName = customerdata.name;
  const clientEmail = customerdata.email;

  const calculateTotalPrice = useCallback(
    (items) => {
      const subtotal = items.reduce((acc, item) => acc + Number(item.price), 0);
      const tipAmount = includeTip ? Math.max(0, Number(customTip)) : 0;
      const finalPrice = subtotal + tipAmount;
      setTotalPrice(finalPrice);
    },
    [includeTip, customTip]
  );

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!customerdata._id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const savedCart = Cookies.get("addtocart");

    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      if (cartData && cartData.length > 0) {
        setCartItems(cartData);
        setIsCartEmpty(false);
        calculateTotalPrice(cartData);
      } else {
        setCartItems([]);
        setIsCartEmpty(true);
        setError("Your cart is empty.");
      }
    } else {
      setCartItems([]);
      setIsCartEmpty(true);
      setError("Your cart is empty.");
    }
    setLoading(false);
  }, [calculateTotalPrice, customerdata._id]);

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
    Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 2 / 24 });
  };

  const handleRemoveItem = async (foodid) => {
    const updatedItems = cartItems.filter((item) => item.foodid !== foodid);
    setCartItems(updatedItems);
    calculateTotalPrice(updatedItems);
    Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 2 / 24 });

    if (updatedItems.length === 0) {
      setIsCartEmpty(true);
      setError("Your cart is empty.");
    }
  };

  const handleTipChange = () => {
    setIncludeTip((prev) => !prev);
  };

  const handleOrderPlaced = async () => {
    try {

      const tip = Number(customTip);
      if (includeTip && (tip < 10 || tip > 500)) {
        showPopup("Please enter a tip between ₹10 and ₹500.", "error");
        return;
      }

      const cartData = {
        customerid: customerdata._id,
        data: cartItems.map((item) => ({
          foodid: item.foodid,
          foodcode: item.foodcode || "",
          foodname: item.foodname || "",
          quantity: item.quantity || 1,
          price: item.price || "0",
          imageurl: item.imageurl || "",
        })),
        totalamount: parseInt(totalPrice),
        includetip: includeTip ? 1 : 0,
        tipamount: customTip
      };

      const response = await axios.post(`${backendurl}addtocart`, cartData);

      if (response.status === 200) {
        navigate(`/order/history/${redirecturl}`);
        Cookies.remove("addtocart");
      } else {
        alert("Failed to place the order. Please try again.");
      }
    } catch (err) {
      console.error("Error placing the order:", err);
      // alert("Error placing the order. Please try again.");
    }
  };

  return (
    <>
      <div className="view-cart-container">
        <h2 className="view-cart-h2">Your Cart</h2>
        <hr
          style={{
            backgroundColor: "#47d9a8",
            height: "2px",
            border: "none",
          }}
        />
        <div className="customer-details">
          <p>Name: {clientName}</p>
          <p>Email: {clientEmail}</p>
          <p>Table No: {tableNo}</p>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="empty-cart">{error}</p>
        ) : cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          <div>
            <div className="view-cart-items">
              {cartItems.map((item) => (
                <div key={item._id} className="view-cart-item">
                  <img src={item.imageurl} alt={item.foodname} className="view-cart-item-image" />
                  <div className="view-cart-item-details">
                    <h4 className="view-cart-item-details-h4">{item.foodname}</h4>
                    <p className="view-cart-item-details-p">Price: ₹{Number(item.price).toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button className="view-cart-item-details-button" onClick={() => handleQuantityChange(item.foodid, item.quantity - 1)}>
                        <i className="fa-solid fa-minus fa-lg"></i>
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button className="view-cart-item-details-button" onClick={() => handleQuantityChange(item.foodid, item.quantity + 1)}>
                        <i className="fa-solid fa-plus fa-lg"></i>
                      </button>
                    </div>
                    <button className="view-cart-item-details-button" onClick={() => handleRemoveItem(item.foodid)}>
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="tip-checkbox">
              <label className="switch-wrapper">
                <input
                  type="checkbox"
                  checked={includeTip}
                  onChange={handleTipChange}
                  id="tip-checkbox"
                  className="switch-checkbox"
                />
                <span className="switch-slider" />
                <span className="switch-label">Include Tip</span>
              </label>

              {includeTip && (
                <input
                  type="text"
                  value={customTip}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setCustomTip(value === '0' ? '0' : Number(value));
                  }}
                  className="tip-amount-input"
                  placeholder="Min ₹10"
                />
              )}
            </div>

            <h3 className="total-price-h3">Total Price: ₹{totalPrice.toFixed(2)}</h3>

            <div className="view-cart-summary">
              <button className="view-cart-checkout-button spaced-button" onClick={() => navigate(`/dine-in/menu/${redirecturl}`)}>Add Another Item</button>
              <button className="view-cart-checkout-button spaced-button" onClick={handleOrderPlaced}>Order Placed</button>
              <button className="view-cart-checkout-button spaced-button" onClick={() => navigate(`/order/history/${redirecturl}`)}>View Last Orders</button>
            </div>
          </div>
        )}

        {/* Show buttons only if cart is empty */}
        {isCartEmpty && (
          <div style={{ marginTop: "20px" }}>
            <button className="view-cart-checkout-button spaced-button" onClick={() => navigate(`/dine-in/menu/${redirecturl}`)}>Add something</button>
            <button className="view-cart-checkout-button spaced-button" onClick={() => navigate(`/order/history/${redirecturl}`)}>View Last Orders</button>
          </div>
        )}
      </div >
      {
        popup.visible && (
          <div className={`popup ${popup.type}`}>
            {popup.message}
            <span
              className="material-symbols-outlined close-icon"
              tabIndex="-1"
              onClick={() => setPopup({ ...popup, visible: false })}
            >
              close
            </span>
          </div>
        )
      }
    </>

  );
}
