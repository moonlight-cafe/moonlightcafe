import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.js';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './OrderHistory.css';

const Methods = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;

const OrderHistory = () => {
        const navigate = useNavigate();
        const navbarRef = useRef(null);
        const customerdata = Methods.checkLoginStatus();
        const tabledata = Methods.checkSelectedTable();
        const [orders, setOrders] = useState([]);
        const [openAccordion, setOpenAccordion] = useState(null);
        const [modalVisible, setModalVisible] = useState(false);
        const [includeTip, setIncludeTip] = useState(false);
        const [customTip, setCustomTip] = useState("");
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const popupTimer = useRef(null);
        const [loadingOrders, setLoadingOrders] = useState(true);
        const [isAnimatingOut, setIsAnimatingOut] = useState(false);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type);
        };

        useEffect(() => {
                AOS.init({ duration: 800, once: true, mirror: false, disable: false });
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
                                setLoadingOrders(true);
                                const customer = Methods.getCookie('customerdata');
                                const response = await BackendAPIs.ViewCart(customer._id, 1);
                                setOrders(response.data || []);
                        } catch (error) {
                                console.error("Error fetching order history:", error);
                        } finally {
                                setLoadingOrders(false);
                        }
                };

                fetchOrderHistory();
        }, []);

        const toggleAccordion = (index) => {
                setOpenAccordion(openAccordion === index ? null : index);
        };

        const handleAddMoreItems = () => navigate(`/dine-in/menu/${tabledata.data.id}`);
        const handleReturnToCart = () => navigate(`/view-cart/${tabledata.data.id}`);

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
                                tipamount: tipAmount,
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

        const hasOrders = orders.some(order => Array.isArray(order.data) && order.data.length > 0);


        const activeOrderCount = useMemo(() =>
                orders.filter(order => Array.isArray(order.data) && order.data.length > 0).length,
                [orders]
        );

        const totalOrderedItems = useMemo(() =>
                orders.reduce((acc, order) => (
                        acc + (Array.isArray(order.data)
                                ? order.data.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
                                : 0)
                ), 0),
                [orders]
        );

        const tipAmount = useMemo(() =>
                includeTip ? Number(customTip || 0) : 0,
                [includeTip, customTip]
        );

        const finalTotalAmount = useMemo(() =>
                orders.reduce((acc, order) => acc + Number(order.totalamount), 0),
                [orders]
        );

        const gstPercent = useMemo(() =>
                Config.allowtax === 1 ? Number(Config.taxdetails?.dineintax || 0) : 0,
                []
        );

        const gstAmount = useMemo(() =>
                Config.allowtax === 1 ? (finalTotalAmount * gstPercent) / 100 : 0,
                [finalTotalAmount, gstPercent]
        );

        const grandTotal = useMemo(() =>
                finalTotalAmount + gstAmount + tipAmount,
                [finalTotalAmount, gstAmount, tipAmount]
        );

        const handleOpenPastOrders = () => {
                if (navbarRef.current) {
                        navbarRef.current.openOrders();
                }
        };

        const tableNo = tabledata?.data?.table_no || "N/A";
        const clientName = customerdata?.data?.name || "Guest";
        const clientEmail = customerdata?.data?.email || "";

        return (
                <div className="history-page-wrapper user-not-select">
                        <Navbar ref={navbarRef} />
                        {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup, popupTimer))}

                        <header className="history-header-v2" data-aos="fade-down">
                                <div className="history-header-main">
                                        <span className="material-symbols-outlined history-header-icon">receipt_long</span>
                                        <div className="history-header-copy">
                                                <span className="history-header-tag">Dine-In History</span>
                                                <h1>Order Summary</h1>
                                        </div>
                                </div>

                                <div className="history-context-board">
                                        <div className="history-board-intro">
                                                <span className="material-symbols-outlined">room_service</span>
                                                <div>
                                                        <p>Track everything already sent from your table.</p>
                                                        <small>Review active orders, add more dishes, or move to billing when you're ready.</small>
                                                </div>
                                        </div>

                                        <div className="history-board-grid">
                                                <div className="history-detail-card">
                                                        <span className="history-detail-label">Serving Table</span>
                                                        <div className="history-detail-value">
                                                                <span className="material-symbols-outlined">table_restaurant</span>
                                                                <strong>{tableNo}</strong>
                                                        </div>
                                                </div>

                                                <div className="history-detail-card">
                                                        <span className="history-detail-label">Guest Name</span>
                                                        <div className="history-detail-value">
                                                                <span className="material-symbols-outlined">person</span>
                                                                <strong>{clientName}</strong>
                                                        </div>
                                                </div>

                                                {clientEmail ? (
                                                        <div className="history-detail-card">
                                                                <span className="history-detail-label">Login Email</span>
                                                                <div className="history-detail-value">
                                                                        <span className="material-symbols-outlined">alternate_email</span>
                                                                        <strong>{clientEmail}</strong>
                                                                </div>
                                                        </div>
                                                ) : null}
                                        </div>

                                        <div className="history-quick-actions history-board-actions">
                                                <button className="outline-premium-btn" onClick={handleOpenPastOrders}>
                                                        <span className="material-symbols-outlined">history</span>
                                                        Past Orders
                                                </button>
                                                <button className="outline-premium-btn" onClick={handleAddMoreItems}>
                                                        <span className="material-symbols-outlined">add_shopping_cart</span>
                                                        Add More
                                                </button>
                                                <button className="outline-premium-btn" onClick={handleReturnToCart}>
                                                        <span className="material-symbols-outlined">arrow_back</span>
                                                        Return to Cart </button>
                                        </div>
                                </div>
                        </header>

                        <main className="history-container-v2">
                                {loadingOrders ? (
                                        <div className="loader-center">
                                                {Methods.showLoader()}
                                                <p className="loading-text">Fetching your orders...</p>
                                        </div>
                                ) : !hasOrders ? (
                                        <div className="empty-history-state">
                                                <span className="empty-history-state-span material-symbols-outlined">receipt_long</span>
                                                <h2 className="empty-history-state-h2">No active orders</h2>
                                                <p className="empty-history-state-p">You haven't placed any orders for this session yet.</p>
                                                <button className="main-btn mt-25" onClick={handleAddMoreItems}>
                                                        View Menu
                                                </button>
                                        </div>
                                ) : (
                                        <div className="history-grid-layout">
                                                <section className="active-orders-column">
                                                        {orders.map((order, index) => (
                                                                <div key={order._id}
                                                                        className={`active-order-card ${openAccordion === index ? 'active-order-card--open' : ''}`}
                                                                        style={{ animationDelay: `${index * 70}ms` }}>

                                                                        {/* ── Header ── */}
                                                                        <div className="card-header" onClick={() => toggleAccordion(index)}>
                                                                                <div className="header-left">
                                                                                        <span className="card-order-num">Order #{index + 1}</span>
                                                                                        <div className="card-meta-row">
                                                                                                <span className="order-time">
                                                                                                        <span className="material-symbols-outlined">schedule</span>
                                                                                                        {Methods.formatReadableDate(order.createdAt)}
                                                                                                </span>
                                                                                                <div className="item-count-badge">{order.data.length} {order.data.length === 1 ? 'item' : 'items'}</div>
                                                                                        </div>
                                                                                </div>
                                                                                <div className="card-header-right">
                                                                                        <span className="card-subtotal-preview">₹{order.totalamount}</span>
                                                                                        <div className={`expand-icon ${openAccordion === index ? "rotated" : ""}`}>
                                                                                                <span className="material-symbols-outlined">keyboard_arrow_down</span>
                                                                                        </div>
                                                                                </div>
                                                                        </div>

                                                                        {/* ── Body ── */}
                                                                        <div className={`card-body ${openAccordion === index ? "expanded" : ""}`}>
                                                                                <div className="order-items-list">
                                                                                        {order.data.map((item, i) => (
                                                                                                <div key={i} className="mini-item-row">
                                                                                                        <div className="mini-img-wrap">
                                                                                                                <img src={item.imageurl} alt={item.foodname} />
                                                                                                                <span className="mini-qty-chip">×{item.quantity}</span>
                                                                                                        </div>
                                                                                                        <div className="mini-details">
                                                                                                                <h4>{item.foodname}</h4>
                                                                                                                <p>₹{item.price} <em>each</em></p>
                                                                                                        </div>
                                                                                                        <div className="mini-line-total">₹{(item.price * item.quantity).toFixed(2)}</div>
                                                                                                </div>
                                                                                        ))}
                                                                                </div>
                                                                                <div className="order-card-footer">
                                                                                        <div className="order-card-footer-label">
                                                                                                <span className="material-symbols-outlined">receipt</span>
                                                                                                Subtotal
                                                                                        </div>
                                                                                        <span className="order-card-footer-amt">₹{order.totalamount}</span>
                                                                                </div>
                                                                        </div>

                                                                </div>
                                                        ))}
                                                </section>

                                                <aside className="billing-sidebar-column" data-aos="fade-left">
                                                        <div className="billing-panel billing-panel-compact">
                                                                <div className="billing-compact-header">
                                                                        <div>
                                                                                <span className="billing-kicker">Billing Summary</span>
                                                                        </div>
                                                                </div>

                                                                <div className="billing-inline-stats">
                                                                        <div className="billing-inline-stat">
                                                                                <span className="billing-inline-stat-span main-color">Orders</span>
                                                                                <strong className="billing-inline-stat-strong">{activeOrderCount}</strong>
                                                                        </div>
                                                                        <div className="billing-inline-stat">
                                                                                <span className="billing-inline-stat-span main-color">Items</span>
                                                                                <strong className="billing-inline-stat-strong">{totalOrderedItems}</strong>
                                                                        </div>
                                                                        <div className="billing-inline-stat">
                                                                                <span className="billing-inline-stat-span main-color">Base</span>
                                                                                <strong className="billing-inline-stat-strong">₹{finalTotalAmount.toFixed(2)}</strong>
                                                                        </div>
                                                                </div>

                                                                <div className="billing-breakdown">
                                                                        <div className="tip-section-v2 tip-section-compact">
                                                                                <label className="tip-toggle">
                                                                                        <input
                                                                                                type="checkbox"
                                                                                                checked={includeTip}
                                                                                                onChange={() => setIncludeTip(!includeTip)}
                                                                                        />
                                                                                        <div className="toggle-ui"></div>
                                                                                        <span>Add a Tip?</span>
                                                                                </label>

                                                                                {includeTip && (
                                                                                        <div className="tip-input-wrap tip-input-compact" data-aos="fade-right">
                                                                                                <span className="currency-symbol">₹</span>
                                                                                                <input
                                                                                                        type="text"
                                                                                                        value={customTip}
                                                                                                        onChange={(e) => setCustomTip(e.target.value.replace(/\D/g, ""))}
                                                                                                        placeholder="Amount"
                                                                                                        maxLength={3}
                                                                                                        autoFocus
                                                                                                />
                                                                                        </div>
                                                                                )}
                                                                        </div>

                                                                        {includeTip ? (
                                                                                <div className="billing-line">
                                                                                        <span>Tip</span>
                                                                                        <span>₹{tipAmount.toFixed(2)}</span>
                                                                                </div>
                                                                        ) : null}

                                                                        {Config.allowtax === 1 && (
                                                                                <div className="billing-line">
                                                                                        <span>GST ({gstPercent}%)</span>
                                                                                        <span>₹{gstAmount.toFixed(2)}</span>
                                                                                </div>
                                                                        )}

                                                                        <div className="billing-line total-billing-line">
                                                                                <span>Grand Total</span>
                                                                                <span>₹{grandTotal.toFixed(2)}</span>
                                                                        </div>

                                                                </div>
                                                                <div className="billing-action-group">
                                                                        <button
                                                                                className="main-btn"
                                                                                onClick={handleProceedToBilling}
                                                                        >
                                                                                Proceed to Billing
                                                                        </button>
                                                                </div>
                                                        </div>
                                                </aside>
                                        </div>
                                )}
                        </main>

                        {/* Billing Modal */}
                        {modalVisible && (
                                <div className={`modal-overlay user-not-select ${isAnimatingOut ? "fade-out" : ""}`}>
                                        <div className={`modal-content-select width-40 alert-modal ${isAnimatingOut ? "fade-out" : ""}`}>
                                                <span className="material-symbols-outlined main-color modal-icon fs-50">receipt_long</span>
                                                <h3 className="modal-title fs-25">Confirm Billing?</h3>
                                                <p className="main-color fs-20">
                                                        Please review your summary. Once confirmed, you'll be directed to the final bill.
                                                </p>
                                                <p className="required fs-18">This action cannot be undone.</p>
                                                <div className="mt-20">
                                                        <button className="main-btn mr-20 plr-40" onClick={handleModalConfirm}>Confirm</button>
                                                        <button className="main-cancle-btn ml-20 plr-40" onClick={handleModalNo}>Cancel</button>
                                                </div>
                                        </div>
                                </div>
                        )}
                </div>
        );
};

export default OrderHistory;
