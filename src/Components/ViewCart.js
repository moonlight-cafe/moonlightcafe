import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type, 5000);
  };

  useEffect(() => {
    if (customerdata.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (tabledata.status !== 200) {
      navigate("/dine-in/select-table");
      return;
    }
  }, [navigate]);
  const tableNo = tabledata.data.table_no;
  const clientName = customerdata.data.name;
  const clientEmail = customerdata.data.email;

  const calculateTotalPrice = useCallback((items) => {
    const subtotal = items.reduce((acc, item) => acc + Number(item.price), 0);
    setTotalPrice(subtotal);
  }, []);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!customerdata.data._id) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const savedCart = Methods.getCookie("addtocart");
    if (savedCart) {
      if (savedCart && savedCart.length > 0) {
        setCartItems(savedCart);
        setIsCartEmpty(false);
        calculateTotalPrice(savedCart);
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
  }, [calculateTotalPrice, customerdata.data._id]);

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
          navigate(`/order/history/${tabledata.data.id}`);
        }, 1000);
      } else {
        showPopup("Failed to place the order. Please try again.", "error");
        setIsPlacingOrder(false); // allow retry
      }
    } catch (err) {
      console.error("Error placing the order:", err);
      showPopup("Something went wrong. Please try again later.", "error");
      setIsPlacingOrder(false); // allow retry
    }
  };

  return (
    <>
      <div className="view-cart-container">
        <h2 className="view-cart-h2">Your Cart</h2>
        <hr style={{ backgroundColor: "#47d9a8", height: "2px", border: "none" }} />
        <div className="record-info mt-20">
          <div className="record-info-item fs-18">
            <strong>Customer:</strong> {clientName}
          </div>

          <div className="record-info-item fs-18">
            <strong>Email:</strong> {clientEmail}
          </div>

          <div className="record-info-item fs-18">
            <strong>Table No:</strong>  {tableNo}
          </div>
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
                    <p className="view-cart-item-details-p fs-18">Price: ₹{Number(item.price).toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button className="main-btn plr-10 ptb-1" onClick={() => handleQuantityChange(item.foodid, item.quantity - 1)}>
                        <span className="material-symbols-outlined mt-5">remove</span>
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button className="main-btn plr-10 ptb-1" onClick={() => handleQuantityChange(item.foodid, item.quantity + 1)}>
                        <span className="material-symbols-outlined mt-5">add</span>
                      </button>
                    </div>
                    <button className="main-btn plr-10 ptb-1" onClick={() => handleRemoveItem(item.foodid)}>
                      <span className="material-symbols-outlined mt-5">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="total-price-h3">Price: ₹{totalPrice.toFixed(2)}</h3>

            <div className="view-cart-summary">
              <button className="main-btn fs-18" onClick={() => navigate(`/dine-in/menu/${tabledata.data.id}`)}>Add Another Item</button>
              <button className="main-btn mr-20 ml-20 fs-18" onClick={handleOrderPlaced} disabled={isPlacingOrder}>
                {isPlacingOrder ? "Placing Order..." : "Order Placed"}
              </button>
              <button className="main-btn fs-18" onClick={() => navigate(`/order/history/${tabledata.data.id}`)}>View Last Orders</button>
            </div>
          </div>
        )}

        {isCartEmpty && (
          <div style={{ marginTop: "20px" }}>
            <button className="main-btn mr-20 fs-18" onClick={() => navigate(`/dine-in/menu/${tabledata.data.id}`)}>Add something</button>
            <button className="main-btn fs-18" onClick={() => navigate(`/order/history/${tabledata.data.id}`)}>View Last Orders</button>
          </div>
        )}
      </div>

      {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}
    </>
  );
}
