import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import './OrderHistory.css';
import { useNavigate, useParams } from 'react-router-dom';

const Methods = SharedMethod;
const Config = SharedConfig;
const BackendAPIs = SharedAPI;

const TakeAwayOrderHistory = () => {
        const navigate = useNavigate();
        const { randomString } = useParams();
        const customerdata = Methods.checkLoginStatus();

        const [orders, setOrders] = useState([]);
        const [previousOrders, setPreviousOrders] = useState([]);
        const [openAccordion, setOpenAccordion] = useState(null);
        const [sidebarAccordion, setSidebarAccordion] = useState(null);
        const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const popupTimer = useRef(null);
        const [loadingPastOrders, setLoadingPastOrders] = useState(false);
        const [modalVisible, setModalVisible] = useState(false);
        const [isAnimatingOut, setIsAnimatingOut] = useState(false);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type);
        };

        /* ================= AUTH ================= */
        useEffect(() => {
                if (customerdata.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                }
        }, [navigate]);

        /* ================= CURRENT CART ================= */
        useEffect(() => {
                const fetchOrders = async () => {
                        try {
                                const response = await BackendAPIs.ViewCart(
                                        customerdata.data._id,
                                        2 // TAKE AWAY
                                );
                                setOrders(response.data || []);
                        } catch (err) {
                                console.error(err);
                        }
                };
                fetchOrders();
        }, []);

        const toggleAccordion = (index) => {
                setOpenAccordion(openAccordion === index ? null : index);
        };

        const toggleSidebarAccordion = (index) => {
                setSidebarAccordion(sidebarAccordion === index ? null : index);
        };

        const renderOrderRow = (item, i) => (
                <tr key={i}>
                        <td>
                                <img src={item.imageurl} alt={item.foodname} className="food-avatar" />
                        </td>
                        <td>{item.foodname}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.price}</td>
                </tr>
        );

        const hasOrders = orders.some(o => Array.isArray(o.data) && o.data.length > 0);

        const finalTotalAmount = useMemo(() =>
                orders.reduce((acc, o) => acc + Number(o.totalamount), 0),
                [orders]
        );

        /* ================= PREVIOUS ORDERS ================= */
        const fetchPreviousOrders = async () => {
                try {
                        setLoadingPastOrders(true);
                        Methods.toggleSidebar(setIsSidebarOpen, true);

                        const response = await BackendAPIs.FetchPastOrders({
                                customerid: customerdata.data._id,
                                servicetype: [2]
                        });

                        setPreviousOrders(response.data || []);
                } catch (err) {
                        console.error(err);
                } finally {
                        setLoadingPastOrders(false);
                }
        };

        /* ================= BILLING ================= */
        const handleProceedToBilling = () => {
                setModalVisible(true);
        };

        const handleModalConfirm = async () => {
                try {
                        const payload = {
                                customerid: customerdata.data._id,
                                customername: customerdata.data.name,
                                servicetype: 2,
                                orderid: randomString
                        };

                        const response = await BackendAPIs.DiningConfirmBilling(payload);

                        if (response.status === 200) {
                                setIsAnimatingOut(true);
                                setTimeout(() => {
                                        setModalVisible(false);
                                        setIsAnimatingOut(false)
                                }, 300);
                                navigate(`/take-away/billing/${response.data._id}`);
                        } else {
                                setIsAnimatingOut(true);
                                setTimeout(() => {
                                        setModalVisible(false);
                                        setIsAnimatingOut(false)
                                }, 300);
                                showPopup(response.message || "Billing failed");
                        }
                } catch (err) {
                        console.error(err);
                        showPopup("Something went wrong");
                }
        };

        const handleModalNo = () => {
                setIsAnimatingOut(true);
                setTimeout(() => {
                        setModalVisible(false);
                        setIsAnimatingOut(false)
                }, 300);
        };

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
                                                                <div
                                                                        className="accordion-header"
                                                                        onClick={() => toggleAccordion(index)}
                                                                >
                                                                        <span className="order-placed-text">
                                                                                {Methods.formatReadableDate(order.createdAt)}
                                                                        </span>
                                                                        <span className={`plus ${openAccordion === index ? "open" : ""}`}>
                                                                                <i className="fa-solid fa-plus"></i>
                                                                        </span>
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
                                                                                                <tbody>
                                                                                                        {order.data.map(renderOrderRow)}
                                                                                                </tbody>
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

                                                <div className="final-total-amount">
                                                        <h3>Total Amount: ₹{finalTotalAmount.toFixed(2)}</h3>
                                                </div>

                                                <div className="button-wrapper">
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/view-cart/${randomString}`)}>
                                                                Back to View Cart
                                                        </button>

                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/menu/${randomString}`)}>
                                                                Add More Items
                                                        </button>

                                                        <button className="main-btn fs-18" onClick={handleProceedToBilling}>
                                                                Proceed to Billing
                                                        </button>
                                                </div>
                                        </>
                                ) : (
                                        <>
                                                <p className="no-orders-text">No orders found.</p>
                                                <div className="button-wrapper">
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/view-cart/${randomString}`)}>
                                                                Back to View Cart
                                                        </button>
                                                        <button className="main-btn fs-18" onClick={() => navigate(`/take-away/menu/${randomString}`)}>
                                                                Add More Items
                                                        </button>
                                                </div>
                                        </>
                                )}
                        </div>

                        {isSidebarOpen && (
                                <div
                                        className="sidebar-overlay"
                                        onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}
                                />
                        )}

                        <div className={`sidebar-history-panel ${isSidebarOpen ? 'open' : ''}`}>
                                <button
                                        className="sidebar-close-btn user-not-select"
                                        onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}
                                >
                                        <span className="material-symbols-outlined">close</span>
                                </button>

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
                                                                        <p></p>
                                                                        <p className='mr-10'>Total: ₹{order.totalamount}</p>
                                                                </div>
                                                        </div>
                                                </div>
                                        ))
                                )}
                        </div>

                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}

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


                </>
        );
};

export default TakeAwayOrderHistory;
