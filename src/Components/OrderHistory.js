import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './OrderHistory.css';
import { useNavigate } from 'react-router-dom';

const Methods = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;

const OrderHistory = () => {
        const navigate = useNavigate();
        const customerdata = Methods.checkLoginStatus();
        const tabledata = Methods.checkSelectedTable();
        const [orders, setOrders] = useState([]);
        const [previousOrders, setPreviousOrders] = useState([]);
        const [openAccordion, setOpenAccordion] = useState(null);
        const [sidebarAccordion, setSidebarAccordion] = useState(null);
        const [modalVisible, setModalVisible] = useState(false);
        const [includeTip, setIncludeTip] = useState(false);
        const [customTip, setCustomTip] = useState("");
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const popupTimer = useRef(null);
        const [loadingPastOrders, setLoadingPastOrders] = useState(false);
        const [isAnimatingOut, setIsAnimatingOut] = useState(false);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type);
        };

        useEffect(() => {
                if (customerdata.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                        return;
                }

                if (tabledata.status !== 200) {
                        navigate("/dine-in/select-table");
                }
        }, [navigate]);

        useEffect(() => {
                const fetchOrderHistory = async () => {
                        try {
                                const customerdata = Methods.getCookie('customerdata');
                                const response = await BackendAPIs.ViewCart(customerdata._id, 1)
                                setOrders(response.data || []);
                        } catch (error) {
                                console.error("Error fetching order history:", error);
                        }
                };

                fetchOrderHistory();
        }, []);

        useEffect(() => {
                const handleBeforeUnload = (e) => {
                        // Standard way to show confirmation dialog
                        e.preventDefault();
                        e.returnValue = ''; // Required for Chrome
                };

                window.addEventListener('beforeunload', handleBeforeUnload);

                return () => {
                        window.removeEventListener('beforeunload', handleBeforeUnload);
                };
        }, []);

        const toggleAccordion = (index) => {
                setOpenAccordion(openAccordion === index ? null : index);
        };

        const toggleSidebarAccordion = (index) => {
                setSidebarAccordion(sidebarAccordion === index ? null : index);
        };

        const handleAddMoreItems = () => navigate(`/dine-in/menu/${tabledata.data.id}`);

        const handleProceedToBilling = () => {
                const tipValue = Number(customTip || 0);
                if (includeTip && (tipValue < 10 || tipValue > 500)) {
                        showPopup("Please enter a tip between ₹10 and ₹500.", "error");
                        return;
                }
                setModalVisible(true);
        };

        const handleModalConfirm = async () => {
                try {
                        const payload = {
                                customerid: customerdata.data._id,
                                customername: customerdata.data.name,
                                tableno: tabledata.data.table_no,
                                totalamount: grandTotal.toFixed(2),
                                includetip: includeTip ? 1 : 0,
                                tipamount: includeTip ? Number(customTip || 0) : 0,
                                servicetype: 1
                        };
                        const response = await BackendAPIs.DiningConfirmBilling(payload);

                        if (response.status === 200) {
                                setIsAnimatingOut(true);
                                setTimeout(() => {
                                        setModalVisible(false);
                                        setIsAnimatingOut(false)
                                }, 300);
                                navigate(`/dine-in/billing/${response.data._id}`);
                        } else {
                                showPopup(response.message || "Billing failed", "error");
                                setIsAnimatingOut(true);
                                setTimeout(() => {
                                        setModalVisible(false);
                                        setIsAnimatingOut(false)
                                }, 300);
                        }
                } catch (err) {
                        console.error("Billing error:", err);
                        showPopup("Something went wrong during billing.", "error");
                        setIsAnimatingOut(true);
                        setTimeout(() => {
                                setModalVisible(false);
                                setIsAnimatingOut(false)
                        }, 300);
                }
        };

        const handleModalNo = () => {
                setIsAnimatingOut(true);
                setTimeout(() => {
                        setModalVisible(false);
                        setIsAnimatingOut(false)
                }, 300);
        };

        const renderOrderRow = (item, i) => (
                <tr key={i}>
                        <td>
                                <img src={item.imageurl} alt={item.foodname} className="food-avatar" />
                        </td>
                        <td>{item.foodname}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price || "N/A"}</td>
                </tr>
        );

        const hasOrders = orders.some(order => Array.isArray(order.data) && order.data.length > 0);

        const finalTotalAmount = useMemo(() =>
                orders.reduce((acc, order) => acc + Number(order.totalamount), 0),
                [orders]
        );

        const grandTotal = useMemo(() =>
                finalTotalAmount + (includeTip ? Number(customTip || 0) : 0),
                [finalTotalAmount, includeTip, customTip]
        );

        const fetchPreviousOrders = async () => {
                try {
                        setLoadingPastOrders(true);
                        Methods.toggleSidebar(setIsSidebarOpen, true);
                        const response = await BackendAPIs.FetchPastOrders({
                                customerid: customerdata.data._id,
                                servicetype: [1]
                        });

                        setPreviousOrders(response.data || []);
                } catch (error) {
                        console.error('Error fetching previous orders:', error);
                } finally {
                        setLoadingPastOrders(false);
                }
        };

        const renderOldOrders = () => (
                <>
                        <h2 className="sidebar-heading">Previous Orders</h2>
                        {loadingPastOrders ? (
                                Methods.showLoader()
                        ) : previousOrders.length === 0 ? (
                                <>
                                        <div className="notfoundiimg">
                                                <img src={Config.ordernotfoundimg} alt="No Orders Found" className="notfound-image" />
                                        </div>
                                        <p className="no-orders-text">No previous orders found.</p>
                                </>
                        ) : (
                                previousOrders.map((order, index) => (
                                        <div key={index} className="old-custom-accordion">
                                                <div className="accordion-header" onClick={() => toggleSidebarAccordion(index)}>
                                                        <span className="order-placed-text">{Methods.formatReadableDate(order.createdAt)}</span>
                                                        <span className={`plus ${sidebarAccordion === index ? 'open' : ''}`}>
                                                                <i className="fa-solid fa-plus"></i>
                                                        </span>
                                                </div>

                                                <div className={`accordion-body ${sidebarAccordion === index ? 'open' : ''}`}>
                                                        <div className="modal-table-container">
                                                                <div className="modal-table-wrapper">
                                                                        <table className="modal-table">
                                                                                <thead>
                                                                                        <tr>
                                                                                                <th>#</th>
                                                                                                <th>Item</th>
                                                                                                <th>Image</th>
                                                                                                <th>Qty</th>
                                                                                                <th>Price</th>
                                                                                        </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                        {order.data.map((item, i) => (
                                                                                                <tr key={i}>
                                                                                                        <td>{i + 1}</td>
                                                                                                        <td>{item.foodname}</td>
                                                                                                        <td>
                                                                                                                <img
                                                                                                                        src={item.imageurl}
                                                                                                                        alt={item.foodname}
                                                                                                                        className="food-img"
                                                                                                                />
                                                                                                        </td>
                                                                                                        <td>{item.quantity}</td>
                                                                                                        <td>₹{item.price}</td>
                                                                                                </tr>
                                                                                        ))}
                                                                                </tbody>
                                                                        </table>
                                                                </div>
                                                        </div>
                                                        <div className="order-summary-details">
                                                                <p>Tip: {order.includetip ? `₹${order.tipamount}` : 'Not included'}</p>
                                                                <p>Total: ₹{order.totalamount}</p>
                                                        </div>
                                                </div>
                                        </div>
                                ))
                        )}
                </>
        );

        return (
                <>
                        <div className="order-history-wrapper">
                                <h1 className='order-history-heading'>Order History</h1>

                                <div className="final-total-amount user-not-select">
                                        {Methods.tooltip(
                                                "Previous Orders",
                                                <span className="material-symbols-outlined search-history-icon" onClick={fetchPreviousOrders}>search_activity</span>,
                                                "top"
                                        )}
                                </div>

                                {hasOrders ? (
                                        <>
                                                {orders.map((order, index) => (
                                                        <div key={order._id} className="custom-accordion">
                                                                <div className="accordion-header" onClick={() => toggleAccordion(index)}>
                                                                        <span className="order-placed-text">{Methods.formatReadableDate(order.createdAt)}</span>
                                                                        <div className={`order-placed-text plus ${openAccordion === index ? "open" : ""}`}>
                                                                                <i className={`fa-solid ${openAccordion === index ? 'fa-plus' : 'fa-plus'}`}></i>
                                                                        </div>
                                                                </div>
                                                                <div className={`accordion-body ${openAccordion === index ? "open" : ""}`}>
                                                                        <div className="modal-table-container">
                                                                                <div className="modal-table-wrapper">
                                                                                        <table className="modal-table">
                                                                                                <thead>
                                                                                                        <tr>
                                                                                                                <th>Image</th>
                                                                                                                <th>Food Name</th>
                                                                                                                <th>Quantity</th>
                                                                                                                <th>Price</th>
                                                                                                        </tr>
                                                                                                </thead>
                                                                                                <tbody>{order.data.map(renderOrderRow)}</tbody>
                                                                                        </table>
                                                                                </div>
                                                                        </div>
                                                                        <div className="order-summary-details">
                                                                                <p></p>
                                                                                <p>Amount: ₹{order.totalamount}</p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                ))}

                                                <div className="tip-checkbox-row">
                                                        <div className="tip-left">
                                                                <label className="switch-wrapper">
                                                                        <input
                                                                                type="checkbox"
                                                                                checked={includeTip}
                                                                                onChange={() => setIncludeTip(!includeTip)}
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
                                                                                        const value = e.target.value.replace(/\D/g, "");
                                                                                        setCustomTip(value);
                                                                                }}
                                                                                className="tip-amount-input"
                                                                                placeholder="Min ₹10"
                                                                                maxLength={3}
                                                                        />
                                                                )}
                                                        </div>
                                                        <div className="final-total-amount tip-right">
                                                                <h3>Total Amount: ₹{grandTotal.toFixed(2)}</h3>
                                                        </div>
                                                </div>

                                                <div className="button-wrapper">
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/view-cart/${tabledata.data.id}`)}>Back to View Cart</button>
                                                        <button className="main-btn fs-18" onClick={handleAddMoreItems}>Add More Items</button>
                                                        <button className="main-btn fs-18" onClick={handleProceedToBilling}>Proceed to Billing</button>
                                                </div>
                                        </>
                                ) : (
                                        <>
                                                <p className="no-orders-text">No orders found. Please place an order first!</p>
                                                <div className="button-wrapper">
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/view-cart/${tabledata.data.id}`)}>Back to View Cart</button>
                                                        <button className="main-btn fs-18" onClick={handleAddMoreItems}>Add More Items</button>
                                                </div>
                                        </>
                                )}
                        </div>

                        {isSidebarOpen && (
                                <div
                                        className="sidebar-overlay"
                                        onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}
                                ></div>
                        )}

                        {/* Sidebar container */}
                        <div className={`sidebar-history-panel ${isSidebarOpen ? 'open' : ''}`}>
                                <button
                                        className="sidebar-close-btn user-not-select"
                                        onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}
                                >
                                        <span className="material-symbols-outlined">close</span>
                                </button>

                                {renderOldOrders()}
                        </div>

                        {modalVisible && (
                                <div className="modal-overlay user-not-select">
                                        <div className={`modal-content-select width-40 alert-modal ${isAnimatingOut ? "fade-out" : ""}`}>
                                                <span className="material-symbols-outlined main-color fs-50">receipt_long</span>
                                                <h3 className="modal-title fs-25 mt-15">Are you sure you want to proceed?</h3>
                                                <p className="main-color fs-20">
                                                        Please review all order details carefully before confirming.
                                                </p>
                                                <p className="required fs-18">This action cannot be undone.</p>
                                                <div>
                                                        <button className="main-btn mr-20 plr-40" onClick={handleModalConfirm}>Yes</button>
                                                        <button className="main-cancle-btn ml-20 plr-40" onClick={handleModalNo}>No</button>
                                                </div>
                                        </div>
                                </div>
                        )}

                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}
                </>
        );
};

export default OrderHistory;
