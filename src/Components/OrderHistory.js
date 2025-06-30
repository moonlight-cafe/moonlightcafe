import React, { useState, useEffect } from 'react';
import './OrderHistory.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import _Config from '../Config.js';
import _Methods from '../Methods.js';

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;

const OrderHistory = () => {
        const navigate = useNavigate();
        const redirecturl = JSON.parse(Cookies.get("selectedTable") || "{}").redirecturl;

        const [orders, setOrders] = useState([]);
        const [openAccordion, setOpenAccordion] = useState(null);

        useEffect(() => {
                const loginCheck = Methods.checkLoginStatus();
                const tableCheck = Methods.checkSelectedTable();

                if (loginCheck.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                        return;
                }
                if (tableCheck.status !== 200) return navigate("/dine-in/select-table");
        }, [navigate]);

        useEffect(() => {
                const fetchOrderHistory = async () => {
                        try {
                                const customerdata = JSON.parse(Cookies.get('customerdata') || '{}');
                                const response = await axios.post(`${backendurl}viewcart`, {
                                        customerid: customerdata._id,
                                });
                                setOrders(response.data.data || []);
                        } catch (error) {
                                console.error("Error fetching order history:", error);
                        }
                };

                fetchOrderHistory();
        }, []);

        const toggleAccordion = (index) => {
                setOpenAccordion(openAccordion === index ? null : index);
        };

        const handleAddMoreItems = () => navigate(`/dine-in/menu/${redirecturl}`);
        const handleProceedToBilling = () => navigate('/dine-in/billing');

        const renderOrderRow = (item, i) => (
                <tr key={i} className="order-table-body-row">
                        <td className="order-table-body-cell">
                                <img
                                        src={item.imageurl}
                                        alt={item.foodname}
                                        className="food-avatar"
                                />
                        </td>
                        <td className="order-table-body-cell">{item.foodname}</td>
                        <td className="order-table-body-cell">{item.quantity}</td>
                        <td className="order-table-body-cell">₹{item.price || "N/A"}</td>
                        {/* <td className="order-table-body-cell">
                                <span className={`status-badge ${item.status?.toLowerCase().replace(/\s/g, "-") || "pending"}`}>
                                        {item.status || "Pending"}
                                </span>
                        </td> */}
                </tr>
        );

        return (
                <div className="order-history-wrapper">
                        {orders.length > 0 ? (
                                orders.map((order, index) => (
                                        <div key={order._id} className="custom-accordion">
                                                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                                                        <span className="order-placed-text">
                                                                {Methods.formatReadableDate(order.create_at)}
                                                        </span>
                                                        <div className={`order-placed-text plus ${openAccordion === index ? "open" : ""}`}>
                                                                <i className="fa-solid fa-plus"></i>
                                                        </div>
                                                </div>

                                                <div className={`accordion-body ${openAccordion === index ? "open" : ""}`}>
                                                        <div className="order-table-container">
                                                                <table className="order-table">
                                                                        <thead>
                                                                                <tr>
                                                                                        <th className='order-table-head-cell'>Image</th>
                                                                                        <th className='order-table-head-cell'>Food Name</th>
                                                                                        <th className='order-table-head-cell'>Quantity</th>
                                                                                        <th className='order-table-head-cell'>Price</th>
                                                                                        {/* <th className='order-table-head-cell'>Status</th> */}
                                                                                </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                                {order.data.map(renderOrderRow)}
                                                                        </tbody>
                                                                </table>
                                                        </div>

                                                        <div className="order-summary-details">
                                                                <p className="order-tip-included">
                                                                        {/* <span className="material-symbols-outlined" style={{ verticalAlign: "middle", marginRight: "5px" }}>
                                                                                emoji_objects
                                                                        </span> */}
                                                                        Tip Included: {order.includetip ? `Yes || ₹${order.tipamount}` : "No"}
                                                                </p>
                                                                <p className="order-total-amount">
                                                                        Total Amount: ₹{order.totalamount}
                                                                </p>
                                                        </div>
                                                </div>
                                        </div>
                                ))
                        ) : (
                                <p className="no-orders-text">
                                        No orders found. Please place an order first!
                                </p>
                        )}

                        <div className="button-wrapper">
                                <button className="mainbth home-button-animate" onClick={() => navigate(`/view-cart/${redirecturl}`)}>
                                        Back to View Cart
                                </button>
                                <button className="mainbth home-button-animate" onClick={handleAddMoreItems}>
                                        Add More Items
                                </button>
                                <button className="mainbth home-button-animate" onClick={handleProceedToBilling}>
                                        Proceed to Billing
                                </button>
                        </div>
                </div>
        );
};

export default OrderHistory;
