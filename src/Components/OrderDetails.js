import { Config, API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState } from 'react';
import './ViewCart.css';
import './DineInBilling.css';
import Navbar from './Navbar';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const Methods = SharedMethod;
const BackendAPIs = SharedAPI;

const OrderDetails = () => {
        const customerdata = Methods.checkLoginStatus();
        const tabledata = Methods.checkSelectedTable();
        const navigate = useNavigate();
        const { orderid } = useParams();
        const [searchParams] = useSearchParams();
        const [orderData, setOrderData] = useState(null);
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
                Methods.initAOS();
                if (customerdata.status !== 200) {
                        localStorage.setItem("redirectAfterLogin", window.location.pathname);
                        navigate("/login");
                        return;
                }

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
        }, [navigate, customerdata.data?._id, orderid]);

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
                                                </button>
                                        </div>
                                ) : (
                                        <div className="common-tbl-box mlr-20 user-not-select split-layout" data-aos="zoom-in">
                                                <div className="billing-header-modern">
                                                        <div className="bhm-left">
                                                                <div className="bhm-icon-box">
                                                                        <span className="material-symbols-outlined">receipt_long</span>
                                                                </div>
                                                                <div className="bhm-titles">
                                                                        <span className="bhm-subtitle">View Detail</span>
                                                                        <h2 className="bhm-title">Order Details</h2>
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

                                                        {/* Right Side: Order Summary & Actions */}
                                                        <div className="billing-side-right">
                                                                <div className="payment-vertical-card">
                                                                        <div className="pvcard-header">
                                                                                <span className="material-symbols-outlined pvcard-hdr-icon">receipt_long</span>
                                                                                <div>
                                                                                        <p className="pvcard-kicker">Summary</p>
                                                                                        <h3 className="pvcard-title">Order Total</h3>
                                                                                </div>
                                                                        </div>

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
                                                                                                <span className="price-row-val accent">₹{orderData.tipamount?.toFixed(2)}</span>
                                                                                        </div>
                                                                                )}
                                                                        </div>

                                                                        <div className="grand-total-block">
                                                                                <span className="grand-total-label">Total Amount</span>
                                                                                <div className="total-amount-display fs-25">
                                                                                        <span className="amount"><span className="currency fs-30">₹</span> {parseFloat(orderData?.totalamount || 0).toFixed(2)}</span>
                                                                                </div>
                                                                        </div>

                                                                        <div className="payment-interaction-zone">
                                                                                <button className="main-btn mx-auto mb-10" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }} onClick={() => navigate('/')}>
                                                                                        <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>home</span>
                                                                                        Return to Home
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>
                                )}
                        </div>
                </>
        );
};

export default OrderDetails;
