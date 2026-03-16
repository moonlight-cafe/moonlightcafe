import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from 'react';
import './DineInBilling.css'; // ✅ SAME CSS
import Navbar from './Navbar';
import { useNavigate, useParams } from 'react-router-dom';

const Methods = SharedMethod;
const BackendAPIs = SharedAPI;

const TakeAwayBilling = () => {
        const customerdata = Methods.checkLoginStatus();
        const navigate = useNavigate();
        const { orderid } = useParams();
        const [orderData, setOrderData] = useState(null);
        const [paymentMode, setPaymentMode] = useState(null);
        const [isMobile, setIsMobile] = useState(false);
        const [isProcessing, setIsProcessing] = useState(false);
        const [polling, setPolling] = useState(false);
        const [popup, setPopup] = useState({ message: "", type: "", visible: false });
        const popupTimer = useRef(null);

        const showPopup = (message, type = "error") => {
                Methods.showPopup(setPopup, popupTimer, message, type);
        };

        /* ================= INIT ================= */
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
                                const response = await BackendAPIs.DiningBillingListing(customerdata.data._id, 2, orderid);
                                if (response.status === 200 && response.data.length > 0) {
                                        const takeAwayOrder = response.data.find(
                                                o => o.servicetype === 2
                                        );
                                        if (takeAwayOrder) {
                                                setOrderData(takeAwayOrder);
                                                if (takeAwayOrder.adminstatus === 2) {
                                                        showPopup("Admin has already approved your payment.", "success");
                                                        setTimeout(() => navigate(`/thank_you/${orderid}`), 3000);
                                                }
                                        }
                                }
                        } catch (err) {
                                console.error("Billing fetch error:", err);
                        }
                };

                fetchFinalOrders();
        }, [navigate, customerdata.data._id]);

        /* ================= CASH PAYMENT ================= */
        const PayViaCashFunction = async () => {
                if (!orderData?._id) {
                        showPopup("Order not found");
                        return;
                }

                setIsProcessing(true);

                const response = await BackendAPIs.UpdatePaymentStatus(orderData._id, 1);

                if (response.status === 200) {
                        setPaymentMode("cash");
                        setPolling(true);

                        const refresh = await BackendAPIs.DiningBillingListing(customerdata.data._id, 2, orderid);
                        if (refresh.status === 200 && refresh.data.length > 0) {
                                const updated = refresh.data.find(o => o._id === orderData._id);
                                if (updated) setOrderData(updated);
                        }
                }

                setIsProcessing(false);
        };

        /* ================= ADMIN POLLING ================= */
        useEffect(() => {
                let interval;

                const checkAdminStatus = async () => {
                        try {
                                const response = await BackendAPIs.CheckAdminPaymentReceivedStatus(orderData._id);
                                if (response.status === 200) {
                                        clearInterval(interval);
                                        setPolling(false);
                                        Methods.deleteCookie("takeaway")
                                        navigate(`/thank_you/${orderid}`);
                                }
                        } catch (err) {
                                console.error("Polling error:", err);
                        }
                };

                if (polling && orderData?._id) {
                        interval = setInterval(checkAdminStatus, 5000);
                }

                return () => clearInterval(interval);
        }, [polling, orderData, navigate]);

        /* ================= UPI ================= */
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

                        <div className="billing-container" data-aos="zoom-in">
                                <h1 className="billing-title" data-aos="fade-down">
                                        Take Away Billing
                                </h1>

                                <div className="bill-details" data-aos="fade-up" data-aos-delay="200">
                                        <div className="cafe-info">
                                                <h2 className="billing-cafe-title">Moonlight Café</h2>

                                                {orderData ? (
                                                        <div className="info-grid">
                                                                <div><strong>Name:</strong> {customerdata.data.name}</div>
                                                                <div><strong>Order ID:</strong> {orderData.orderno}</div>
                                                                <div><strong>Email:</strong> {customerdata.data.email}</div>
                                                                <div><strong>Number:</strong> {customerdata.data.number}</div>
                                                                <div><strong>Date:</strong> {Methods.formatDate(orderData.createdAt, "dd-mm-yyyy")}</div>
                                                                <div><strong>Service:</strong> Take Away</div>
                                                        </div>
                                                ) : (
                                                        <div className="info-grid">Loading order details...</div>
                                                )}
                                        </div>

                                        {/* ================= ITEMS ================= */}
                                        <table className="bill-table">
                                                <thead>
                                                        <tr>
                                                                <th>#</th>
                                                                <th>Item</th>
                                                                <th>Qty</th>
                                                                <th>Price</th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {orderData?.data.map((item, index) => (
                                                                <tr key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                                                                        <td>{index + 1}</td>
                                                                        <td>{item.foodname}</td>
                                                                        <td>{item.quantity}</td>
                                                                        <td>₹{item.price}</td>
                                                                </tr>
                                                        ))}
                                                </tbody>
                                        </table>

                                        {/* ================= TOTAL ================= */}
                                        <div className="bill-total" data-aos="fade-up" data-aos-delay="600">
                                                <p>Subtotal: ₹{parseFloat(orderData?.amount || 0).toFixed(2)}</p>

                                                {orderData?.allowtax !== 0 && (
                                                        <p>
                                                                Tax ({orderData?.taxpercent || 0}%): ₹
                                                                {parseFloat(orderData?.taxamount || 0).toFixed(2)}
                                                        </p>
                                                )}

                                                <h3>
                                                        Grand Total: ₹{parseFloat(orderData?.totalamount || 0).toFixed(2)}
                                                </h3>
                                        </div>

                                        {/* ================= PAYMENT ================= */}
                                        <div className="payment-buttons">
                                                {orderData?.adminstatus === 0 ? (
                                                        <button
                                                                className="main-btn fs-20"
                                                                onClick={PayViaCashFunction}
                                                                disabled={isProcessing}
                                                        >
                                                                {isProcessing ? "Processing..." : "Pay via Cash"}
                                                        </button>
                                                ) : (
                                                        <p className="payment-note">
                                                                Waiting for admin to approve your cash payment...
                                                        </p>
                                                )}
                                        </div>

                                        {/* ================= UPI QR (DESKTOP) ================= */}
                                        {paymentMode === "upi" && !isMobile && (
                                                <div className="qr-section" data-aos="fade-up" data-aos-delay="1000">
                                                        <p>Scan this QR Code to Pay</p>
                                                        <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiURL)}&size=200x200`}
                                                                alt="UPI QR Code"
                                                                className="qr-code"
                                                        />
                                                </div>
                                        )}
                                </div>
                        </div>

                        {Methods.renderPopup(popup, () =>
                                Methods.hidePopup(setPopup, popupTimer)
                        )}
                </>
        );
};

export default TakeAwayBilling;
