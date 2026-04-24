import { Config, API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from 'react';
import './DineInBilling.css';
import './ViewCart.css';
import Navbar from './Navbar';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const Methods = SharedMethod;
const BackendAPIs = SharedAPI;

const DineInBilling = () => {
        const customerdata = Methods.checkLoginStatus();
        const tabledata = Methods.checkSelectedTable();
        const navigate = useNavigate();
        const { orderid } = useParams();
        const [searchParams] = useSearchParams();
        const type = searchParams.get("type"); // "1" for dine-in
        const [orderData, setOrderData] = useState(null);
        const [paymentMode, setPaymentMode] = useState(null);
        const [isMobile, setIsMobile] = useState(false);
        const [isProcessing, setIsProcessing] = useState(false);
        const [polling, setPolling] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const popupTimer = useRef(null);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type);
        };

        useEffect(() => {
                Methods.initAOS();
                if (customerdata.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                        return;
                }

                setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

                const fetchFinalOrders = async () => {
                        try {
                                setIsLoading(true);
                                const response = await BackendAPIs.DiningBillingListing(customerdata.data._id, 1, orderid);

                                if (response.status === 200 && response.data.length > 0) {
                                        setOrderData(response.data[0]);
                                } else {
                                        setOrderData(null);
                                }
                        } catch (err) {
                                console.error("Error fetching final orders:", err);
                                setOrderData(null);
                        } finally {
                                setIsLoading(false);
                                setTimeout(() => {
                                        Methods.initAOS();
                                }, 100);
                        }
                };

                fetchFinalOrders();
        }, [navigate, customerdata.data._id]);

        const PayViaCashFunction = async () => {
                if (orderData && orderData._id) {
                        setIsProcessing(true);

                        const response = await BackendAPIs.UpdatePaymentStatus(orderData._id, 1);

                        if (response.status === 200) {
                                setPaymentMode("cash");
                                setPolling(true);
                                const response = await BackendAPIs.DiningBillingListing(customerdata.data._id, 1, orderid);

                                if (response.status === 200 && response.data.length > 0) {
                                        setOrderData(response.data[0]);
                                }
                        }

                        setIsProcessing(false);
                } else {
                        console.error("Order ID not found!");
                }
        };
        useEffect(() => {
                let interval;

                const checkAdminStatus = async () => {
                        try {
                                const response = await BackendAPIs.CheckAdminPaymentReceivedStatus(orderData._id);
                                if (response.status === 200) {
                                        clearInterval(interval);
                                        setPolling(false);
                                        setOrderData(prev => ({ ...prev, adminstatus: 2 }));

                                        setTimeout(() => {
                                                navigate(`/thank_you/${orderid}`);
                                        }, 2000);
                                }
                        } catch (err) {
                                console.error("Polling error:", err);
                        }
                };

                if (polling) {
                        interval = setInterval(checkAdminStatus, 2000);
                }

                return () => clearInterval(interval);
        }, [polling, orderData, navigate, orderid]);

        const upiId = "jainilam75-1@okhdfcbank";
        const upiURL = `upi://pay?pa=${upiId}&pn=MoonlightCafe&am=${parseFloat(orderData?.totalamount || 0).toFixed(2)}&cu=INR`;

        useEffect(() => {
                if (paymentMode === "upi" && isMobile) {
                        window.location.href = upiURL;
                }
        }, [paymentMode, isMobile, upiURL]);

        return (
                <>
                        <Navbar />
                        <div className="common-tbl-comtainer">
                                {isLoading ? (
                                        <div className="empty-cart-v2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                                                <div className="pulse-ring">
                                                        <div className="pulse-indicator"></div>
                                                </div>
                                        </div>
                                ) : !orderData ? (
                                        <div className="empty-cart-v2" data-aos="zoom-in">
                                                <span className="material-symbols-outlined">shopping_bag</span>
                                                <h2>Order not found...</h2>
                                                <p>We couldn't locate the details for this order.</p>
                                                <button className="main-cancle-btn mt-25" onClick={() => navigate(tabledata?.status === 200 ? `/dine-in/menu/${tabledata.data.id}` : '/')}>
                                                        Browse Menu
                                                </button><br />
                                        </div>
                                ) : (
                                        <div className="common-tbl-box mlr-20 user-not-select split-layout" data-aos="zoom-in">
                                                <div className="billing-header-modern">
                                                        <div className="bhm-left">
                                                                <div className="bhm-icon-box">
                                                                        <span className="material-symbols-outlined">receipt_long</span>
                                                                </div>
                                                                <div className="bhm-titles">
                                                                        <span className="bhm-subtitle">Final Settlement</span>
                                                                        <h2 className="bhm-title">Dining Bill</h2>
                                                                </div>
                                                        </div>
                                                        <div className="bhm-right">
                                                                <img src={Config.orderlistimag} alt="Order Icon" />
                                                        </div>
                                                </div>

                                                <div className="billing-split-content">
                                                        <div className="billing-side-left">
                                                                <div className="info-ribbon">
                                                                        <div className="ribbon-item">
                                                                                <span className="material-symbols-outlined main-color ribbon-icon">tag</span>
                                                                                <div className="ribbon-text">
                                                                                        <label className="main-color">Order ID</label>
                                                                                        <span>{orderData?.orderno}</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className="ribbon-item">
                                                                                <span className="material-symbols-outlined main-color ribbon-icon">person</span>
                                                                                <div className="ribbon-text">
                                                                                        <label className="main-color">Customer</label>
                                                                                        <span>{customerdata.data.name}</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className="ribbon-item">
                                                                                <span className="material-symbols-outlined main-color ribbon-icon">table_restaurant</span>
                                                                                <div className="ribbon-text">
                                                                                        <label className="main-color">Table</label>
                                                                                        <span>{orderData.tableno || "N/A"}</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className="ribbon-item">
                                                                                <span className="material-symbols-outlined main-color ribbon-icon">calendar_today</span>
                                                                                <div className="ribbon-text">
                                                                                        <label className="main-color">Date</label>
                                                                                        <span>{Methods.formatDate(orderData?.createdAt, "dd-mm-yyyy")}</span>
                                                                                </div>
                                                                        </div>
                                                                </div>

                                                                <div className="common-table-container">
                                                                        <div className="common-table-wrapper">
                                                                                <table className="common-table modern-table">
                                                                                        <thead>
                                                                                                <tr>
                                                                                                        <th className="common-table-th">Item Details</th>
                                                                                                        <th className="common-table-th">Qty</th>
                                                                                                        <th className="common-table-th">Price</th>
                                                                                                        <th className="common-table-th">Subtotal</th>
                                                                                                </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                                {orderData?.data.map((item, index) => (
                                                                                                        <tr key={index}>
                                                                                                                <td className="common-table-td">
                                                                                                                        <div className="item-cell">
                                                                                                                                <span className="item-index">{index + 1}</span>
                                                                                                                                <span className="item-name">{item.foodname}</span>
                                                                                                                        </div>
                                                                                                                </td>
                                                                                                                <td className="common-table-td">{item.quantity}</td>
                                                                                                                <td className="common-table-td">₹{item.price}</td>
                                                                                                                <td className="common-table-td">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                                                                        </tr>
                                                                                                ))}
                                                                                        </tbody>
                                                                                </table>
                                                                        </div>
                                                                </div>
                                                        </div>

                                                        {/* Right Side: Payment Summary & Actions */}
                                                        <div className="billing-side-right">
                                                                <div className="payment-vertical-card">

                                                                        {/* ── Panel header ── */}
                                                                        <div className="pvcard-header">
                                                                                <span className="material-symbols-outlined pvcard-hdr-icon">receipt_long</span>
                                                                                <div>
                                                                                        <p className="pvcard-kicker">Billing Summary</p>
                                                                                        <h3 className="pvcard-title">Checkout</h3>
                                                                                </div>
                                                                        </div>

                                                                        {/* ── Breakdown rows ── */}
                                                                        <div className="price-list">
                                                                                <div className="price-row">
                                                                                        <div className="price-row-label">
                                                                                                <span className="material-symbols-outlined">payments</span>
                                                                                                <span>Base Amount</span>
                                                                                        </div>
                                                                                        <span className="price-row-val">₹{parseFloat(orderData?.amount || 0).toFixed(2)}</span>
                                                                                </div>

                                                                                {orderData?.allowtax !== 0 && (
                                                                                        <div className="price-row">
                                                                                                <div className="price-row-label">
                                                                                                        <span className="material-symbols-outlined">description</span>
                                                                                                        <span>GST ({orderData?.taxpercent || 0}%)</span>
                                                                                                </div>
                                                                                                <span className="price-row-val">₹{parseFloat(orderData?.taxamount || 0).toFixed(2)}</span>
                                                                                        </div>
                                                                                )}

                                                                                {orderData?.includetip === 1 && (
                                                                                        <div className="price-row">
                                                                                                <div className="price-row-label">
                                                                                                        <span className="material-symbols-outlined">volunteer_activism</span>
                                                                                                        <span>Tip</span>
                                                                                                </div>
                                                                                                <span className="price-row-val accent">₹{orderData.tipamount.toFixed(2)}</span>
                                                                                        </div>
                                                                                )}
                                                                        </div>

                                                                        {/* ── Grand total block ── */}
                                                                        <div className="grand-total-block">
                                                                                <span className="grand-total-label">Payable Amount</span>
                                                                                <div className="total-amount-display">
                                                                                        <span className="currency">₹</span>
                                                                                        <span className="amount">{parseFloat(orderData?.totalamount || 0).toFixed(2)}</span>
                                                                                </div>
                                                                        </div>

                                                                        {/* ── Actions ── */}
                                                                        <div className="payment-interaction-zone">
                                                                                {orderData?.adminstatus === 0 ? (
                                                                                        <button className="main-btn plr-40 mx-auto" onClick={PayViaCashFunction} disabled={isProcessing}>
                                                                                                {isProcessing ? "Processing..." : "Pay Via Cash"}
                                                                                        </button>
                                                                                ) : (
                                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                                                                                                {orderData?.adminstatus === 2 ? (
                                                                                                        <div className="modern-status-plate success" style={{ backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2e7d32', border: '1px solid rgba(46, 125, 50, 0.2)' }}>
                                                                                                                <div className="status-plate-left">
                                                                                                                        <span className="material-symbols-outlined" style={{ color: '#2e7d32', marginRight: '10px' }}>check_circle</span>
                                                                                                                        <p style={{ margin: 0, fontWeight: '600' }}>Payment Completed</p>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                ) : (
                                                                                                        <div className="modern-status-plate">
                                                                                                                <div className="status-plate-left">
                                                                                                                        <div className="pulse-ring">
                                                                                                                                <div className="pulse-indicator"></div>
                                                                                                                        </div>
                                                                                                                        <p>Verifying with Cashier...</p>
                                                                                                                </div>
                                                                                                                <span className="material-symbols-outlined status-plate-icon">hourglass_top</span>
                                                                                                        </div>
                                                                                                )}
                                                                                        </div>
                                                                                )}

                                                                                {paymentMode === "upi" && !isMobile && orderData?.adminstatus !== 2 && (
                                                                                        <div className="floating-qr-card">
                                                                                                <p>Scan to Settle Bill</p>
                                                                                                <div className="qr-inner-frame">
                                                                                                        <img
                                                                                                                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiURL)}&size=120x120`}
                                                                                                                alt="UPI QR Code"
                                                                                                        />
                                                                                                </div>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                )}
                        </div>
                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}
                </>
        );
};

export default DineInBilling;
