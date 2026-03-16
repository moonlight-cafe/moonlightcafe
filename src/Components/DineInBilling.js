import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from 'react';
import './DineInBilling.css';
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

                console.log("🚀 ~ DineInBilling.js:38 ~ DineInBilling ~ type>>", typeof (type));

                if (type === "1" && tabledata.status !== 200) {
                        navigate("/dine-in/select-table");
                        return;
                }

                setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

                const fetchFinalOrders = async () => {
                        try {
                                const response = await BackendAPIs.DiningBillingListing(customerdata.data._id, 1, orderid);

                                if (response.status === 200 && response.data.length > 0) {
                                        setOrderData(response.data[0]);

                                        if (response.data[0].adminstatus === 2) {
                                                showPopup("Admin has already Approve your Payment.", "success")
                                                setTimeout(() => {
                                                        navigate(`/thank_you/${orderid}`)
                                                }, 3000);
                                        }
                                }
                        } catch (err) {
                                console.error("Error fetching final orders:", err);
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
                                        navigate(`/thank_you/${orderid}`)
                                }
                        } catch (err) {
                                console.error("Polling error:", err);
                        }
                };

                if (polling) {
                        interval = setInterval(checkAdminStatus, 5000);
                }

                return () => clearInterval(interval);
        }, [polling, orderData, navigate]);

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
                                <h1 className="billing-title" data-aos="fade-down">Dining Billing</h1>

                                <div className="bill-details" data-aos="fade-up" data-aos-delay="200">
                                        <div className="cafe-info">
                                                <h2 className="billing-cafe-title">Moonlight Café</h2>
                                                {orderData ? (
                                                        <div className="info-grid">
                                                                <div><strong>Name:</strong> {customerdata.data.name}</div>
                                                                <div><strong>Order ID:</strong> {orderData.orderno}</div>
                                                                <div><strong>Email:</strong> {customerdata.data.email}</div>
                                                                <div><strong>Number:</strong> {customerdata.data.number}</div>
                                                                <div><strong>Table No:</strong> {tabledata.data.table_no}</div>
                                                                <div><strong>Date:</strong> {Methods.formatDate(orderData.createdAt, "dd-mm-yyyy")}</div>
                                                        </div>
                                                ) : (
                                                        <div className="info-grid">Loading order details...</div>
                                                )}

                                        </div>

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

                                        <div className="bill-total" data-aos="fade-up" data-aos-delay="600">
                                                <p>Subtotal: ₹{parseFloat(orderData?.amount || 0).toFixed(2)}</p>

                                                {orderData?.allowtax !== 0 && (
                                                        <p>Tax ({orderData?.taxpercent || 0}%): ₹{parseFloat(orderData?.taxamount || 0).toFixed(2)}</p>
                                                )}

                                                {orderData?.includetip === 1 && (
                                                        <p>Tip: ₹{orderData.tipamount.toFixed(2)}</p>
                                                )}

                                                <h3>Grand Total: ₹{parseFloat(orderData?.totalamount || 0).toFixed(2)}</h3>
                                        </div>

                                        <div className="payment-buttons">
                                                {orderData?.adminstatus === 0 ? (
                                                        <button className="main-btn" onClick={PayViaCashFunction} disabled={isProcessing}>
                                                                {isProcessing ? "Processing..." : "Pay via Cash"}
                                                        </button>
                                                ) : (
                                                        <p className="payment-note fs-20">
                                                                Waiting for admin to approve your cash payment...
                                                        </p>
                                                )}
                                        </div>

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

export default DineInBilling;
