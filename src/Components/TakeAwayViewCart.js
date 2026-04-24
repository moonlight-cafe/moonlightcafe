import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewCart.css";

const BackendApis = SharedAPI;
const Methods = SharedMethod;

export default function TakeAwayViewCart() {
        const { randomString } = useParams();
        const navigate = useNavigate();

        const customerdata = Methods.checkLoginStatus();

        const [cartItems, setCartItems] = useState([]);
        const [totalPrice, setTotalPrice] = useState(0);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [isCartEmpty, setIsCartEmpty] = useState(false);
        const [isPlacingOrder, setIsPlacingOrder] = useState(false);

        const [popup, setPopup] = useState({
                message: "",
                type: "",
                visible: false,
        });

        const popupTimer = useRef(null);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type, 5000);
        };

        useEffect(() => {
                if (customerdata.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                }
        }, [navigate]);

        const clientName = customerdata?.data?.name || "";
        const clientEmail = customerdata?.data?.email || "";

        const calculateTotalPrice = useCallback((items) => {
                const subtotal = items.reduce(
                        (acc, item) => acc + Number(item.price),
                        0
                );
                setTotalPrice(subtotal);
        }, []);

        const fetchCartItems = useCallback(() => {
                setLoading(true);
                setError(null);

                const savedCart = Methods.getCookie("takeaway_addtocart");

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

        const handleQuantityChange = (foodid, newQuantity) => {
                if (newQuantity < 1) return;

                const updatedItems = cartItems.map((item) => {
                        if (item.foodid === foodid) {
                                const unitPrice =
                                        Number(item.unitPrice) ||
                                        Number(item.price) / Number(item.quantity || 1);
                                const newPrice = unitPrice * newQuantity;
                                return {
                                        ...item,
                                        quantity: newQuantity,
                                        price: newPrice.toString(),
                                };
                        }
                        return item;
                });

                setCartItems(updatedItems);
                calculateTotalPrice(updatedItems);
                Methods.setCookie("takeaway_addtocart", updatedItems, 30);
        };

        const handleRemoveItem = (foodid) => {
                const updatedItems = cartItems.filter(
                        (item) => item.foodid !== foodid
                );

                setCartItems(updatedItems);
                calculateTotalPrice(updatedItems);
                Methods.setCookie("takeaway_addtocart", updatedItems, 30);

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
                                })),
                                totalamount: parseInt(totalPrice),
                                servicetype: 2,
                        };

                        const response = await BackendApis.AddtoCart(cartData);

                        if (response.status === 200) {
                                Methods.deleteCookie("takeaway_addtocart");
                                showPopup("Order placed successfully!", "success");

                                setTimeout(() => {
                                        navigate(`/take-away/order/summery/${randomString}`);
                                }, 1000);
                        } else {
                                showPopup("Failed to place the order.", "error");
                                setIsPlacingOrder(false);
                        }
                } catch (err) {
                        console.error(err);
                        showPopup("Something went wrong.", "error");
                        setIsPlacingOrder(false);
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
                                </div>

                                {loading ? (
                                        <p>Loading...</p>
                                ) : error ? (
                                        <p className="empty-cart">{error}</p>
                                ) : (
                                        <>
                                                <div className="view-cart-items">
                                                        {cartItems.map((item) => (
                                                                <div key={item.foodid} className="view-cart-item">
                                                                        <img
                                                                                src={item.imageurl}
                                                                                alt={item.foodname}
                                                                                className="view-cart-item-image"
                                                                        />

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

                                                <h3 className="total-price-h3">
                                                        Price: ₹{totalPrice.toFixed(2)}
                                                </h3>

                                                <div className="view-cart-summary">
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/menu/${randomString}`)}>
                                                                Add Another Item
                                                        </button>

                                                        <button className="main-btn mr-20 ml-20 fs-18" onClick={handleOrderPlaced} disabled={isPlacingOrder}>
                                                                {isPlacingOrder ? "Placing Order..." : "Order Placed"}
                                                        </button>

                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/order/summery/${randomString}`)}>
                                                                View Last Orders
                                                        </button>
                                                </div>
                                        </>
                                )}

                                {isCartEmpty && (
                                        <div style={{ marginTop: "20px" }}>
                                                <button className="main-btn mr-20 fs-18" onClick={() => navigate(`/take-away/menu/${randomString}`)}>
                                                        Add something
                                                </button>
                                                <button className="main-btn fs-18" onClick={() => navigate(`/take-away/order/summery/${randomString}`)}>
                                                        View Last Orders
                                                </button>
                                        </div>
                                )}
                        </div>

                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}
                </>
        );
}
