import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./ViewCart.css";

export default function ViewCart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [includeTip, setIncludeTip] = useState(false);
  const [tipAmount, setTipAmount] = useState(0); // Store the custom tip amount

  const navigate = useNavigate();
  const order_id = JSON.parse(Cookies.get("TakeAwayUserData") || "{}").order_id;
  const clientName = JSON.parse(Cookies.get("TakeAwayUserData") || "{}").name;
  const clientEmail = JSON.parse(Cookies.get("TakeAwayUserData") || "{}").email;

  const calculateTotalPrice = useCallback(
    (items) => {
      const subtotal = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotalPrice(subtotal + tipAmount); // Include the tip in the total price
    },
    [tipAmount] // Recalculate when the tip changes
  );

  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/view-cart/${order_id}`
        );
        setCartItems(response.data);
        calculateTotalPrice(response.data);
      } catch (err) {
        console.error("Error fetching cart items:", err);
        setError("Failed to fetch cart items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCartItems();
  }, [order_id, calculateTotalPrice]);

  const handleRemoveItem = async (food_id) => {
    try {
      await axios.delete(
        `http://localhost:5000/remove-from-cart/${food_id}`
      );
      const updatedItems = cartItems.filter((item) => item.food_id !== food_id);
      setCartItems(updatedItems);
      calculateTotalPrice(updatedItems);
      Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 5 });
    } catch (err) {
      console.error("Error removing item from cart:", err);
    }
  };

  const handleQuantityChange = async (food_id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(
        `http://localhost:5000/update-quantity/${food_id}`,
        { quantity: newQuantity }
      );
      const updatedItems = cartItems.map((item) =>
        item.food_id === food_id ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateTotalPrice(updatedItems);
      // Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 5 });
      Cookies.set("addtocart", JSON.stringify(updatedItems), { expires: 2 / 24 });
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleTipChange = () => {
    setIncludeTip((prev) => !prev);
    if (includeTip) {
      setTipAmount(0);
    }
    calculateTotalPrice(cartItems);
  };

  const handleTipAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setTipAmount(value);
    calculateTotalPrice(cartItems);
  };

  return (
    <div className="view-cart-container">
      <h2>Your Cart</h2>
      <hr />
      <p>Client Name: {clientName}</p>
      <p>Client Email: {clientEmail}</p>
      <p>Bill No: {order_id}</p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : cartItems.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <button onClick={() => navigate(`/take-away/menu/${order_id}`)}>
            Add something
          </button>
        </>
      ) : (
        <div>
          <div className="view-cart-items">
            {cartItems.map((item) => (
              <div key={item.food_id} className="view-cart-item">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="view-cart-item-image"
                />
                <div className="view-cart-item-details">
                  <h4>{item.name}</h4>
                  <p>Price: {parseFloat(item.price).toFixed(2)} ₹/Rs</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.food_id, item.quantity - 1)
                      }
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <i className="fa-solid fa-minus fa-lg"></i>
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.food_id, item.quantity + 1)
                      }
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <i className="fa-solid fa-plus fa-lg"></i>
                    </button>
                  </div>
                  <button onClick={() => handleRemoveItem(item.food_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="tip-checkbox">
            <input
              type="checkbox"
              checked={includeTip}
              onChange={handleTipChange}
              id="tip-checkbox"
            />
            <label htmlFor="tip-checkbox">Add tip</label>
            {includeTip && (
              <div className="tip-input-container">
                <input
                  type="number"
                  min="0"
                  value={tipAmount}
                  onChange={handleTipAmountChange}
                  placeholder="Enter tip amount"
                />
              </div>
            )}
          </div>

          <div className="view-cart-summary">
            <h3>Total Price: {totalPrice.toFixed(2)} ₹/Rs</h3>
            <button
              className="view-cart-checkout-button spaced-button"
              onClick={() => navigate(`/take-away/menu/${order_id}`)}
            >
              Add another item
            </button>
            <button
              className="view-cart-checkout-button spaced-button"
              onClick={() =>
                navigate("/thank_you", { state: { cartItems, totalPrice } })
              }
            >
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
