import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Navbar.css';

const Config = SharedConfig;
const BackendAPIs = SharedAPI;
const Methods = SharedMethod;

const Navbar = forwardRef((props, ref) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarType, setSidebarType] = useState('orders'); // 'orders' or 'favs'

    // Global Password Modal State
    const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
    const [pwdData, setPwdData] = useState({ old: "", new: "", confirm: "" });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdVisible, setPwdVisible] = useState({ old: false, new: false, confirm: false });

    const [popup, setPopup] = useState({ message: "", type: "", visible: false });
    const popupTimer = useRef(null);

    // Internal Modal Handlers
    const handleUpdatePassword = async () => {
        if (!pwdData.old || !pwdData.new || !pwdData.confirm) return Methods.showPopup(setPopup, popupTimer, "Please fill all fields.", "error");
        if (pwdData.new !== pwdData.confirm) return Methods.showPopup(setPopup, popupTimer, "Passwords do not match.", "error");

        setPwdLoading(true);
        try {
            const customer = Methods.getCookie("customerdata");
            const response = await BackendAPIs.CustomerChangePassword(customer.email, pwdData.old, pwdData.new);
            if (response.status === 200) {
                Methods.showPopup(setPopup, popupTimer, response.message, "success");
                setIsPwdModalOpen(false);
                setPwdData({ old: "", new: "", confirm: "" });
            } else { Methods.showPopup(setPopup, popupTimer, response.message, "error"); }
        } catch (err) { Methods.showPopup(setPopup, popupTimer, "Action failed.", "error"); }
        finally { setPwdLoading(false); }
    };

    // Data States
    const [previousOrders, setPreviousOrders] = useState([]);
    const [favoriteItems, setFavoriteItems] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [sidebarAccordion, setSidebarAccordion] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const popupRef = useRef(null);

    const customerdata = Methods.checkLoginStatus();
    const name = customerdata.status === 200 ? customerdata.data.name : "Guest";
    const userId = customerdata.data?._id || null;

    useImperativeHandle(ref, () => ({
        openOrders() {
            fetchPreviousOrders();
        }
    }));

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) setPopupOpen(false);
        };
        if (popupOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [popupOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const fetchPreviousOrders = async () => {
        setPopupOpen(false);
        setSidebarType('orders');
        setIsSidebarOpen(true);
        setLoadingData(true);
        try {
            const response = await BackendAPIs.FetchPastOrders({ customerid: userId, servicetype: [1, 2] });
            setPreviousOrders(response.data || []);
        } catch (err) {
            console.error('Error fetching previous orders:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchFavoriteItems = async () => {
        setPopupOpen(false);
        setSidebarType('favorites');
        setIsSidebarOpen(true);
        setLoadingData(true);
        try {
            const response = await BackendAPIs.FetchFavItems(userId);
            setFavoriteItems(response.data || []);
        } catch (err) {
            console.error('Error fetching favorites:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleRemoveFavorite = async (item) => {
        try {
            const response = await BackendAPIs.RemoveFavItems(userId, item._id, item.name);
            if (response.status === 200) {
                setFavoriteItems(prev => prev.filter(i => i._id !== item._id));
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    const toggleAccordion = (index) => setSidebarAccordion(sidebarAccordion === index ? null : index);

    const renderOldOrders = () => (
        <div className="sidebar-scroll-box">
            {loadingData ? (
                <div className="sidebar-loader-wrap">{Methods.showLoader()}</div>
            ) : previousOrders.length === 0 ? (
                <div className="sidebar-empty-state">
                    <span className="material-symbols-outlined empty-icon">receipt_long</span>
                    <p>No previous orders found</p>
                    <button className="main-btn" onClick={() => { setIsSidebarOpen(false); navigate('/view-menu'); }}>Order Now</button>
                </div>
            ) : (
                <div className="sidebar-items-stack">
                    {previousOrders.map((order, index) => (
                        <div key={index} className={`soc-card ${sidebarAccordion === index ? 'soc-card--open' : ''}`}>

                            {/* ── Card Header ── */}
                            <div className="soc-header" onClick={() => toggleAccordion(index)}>
                                <div className="soc-header-top">
                                    <span className={`soc-status-pill ${order.paymentmethod === 0 ? 'soc-status--pending' : 'soc-status--paid'}`}>
                                        <span className="material-symbols-outlined">{order.paymentmethod === 0 ? 'pending' : 'check_circle'}</span>
                                        {order.paymentmethod === 0 ? 'Pending' : 'Paid'}
                                    </span>
                                    <span className="soc-date">
                                        <span className="material-symbols-outlined">calendar_today</span>
                                        {Methods.formatReadableDate(order.createdAt)}
                                    </span>
                                </div>
                                <div className="soc-header-bottom">
                                    <div className="soc-left">
                                        <span className="soc-service-tag">{Methods.getServiceType(order.servicetype)}</span>
                                        <span className="soc-item-count">{order.data?.length || 0} items</span>
                                    </div>
                                    <div className="soc-right">
                                        <span className="soc-amount">₹{order.totalamount}</span>
                                        <div className={`soc-chevron ${sidebarAccordion === index ? 'soc-chevron--open' : ''}`}>
                                            <span className="material-symbols-outlined">keyboard_arrow_down</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Expandable Body ── */}
                            <div className={`soc-body ${sidebarAccordion === index ? 'soc-body--open' : ''}`}>
                                <div className="soc-items-list">
                                    {order.data?.map((item, i) => (
                                        <div key={i} className="soc-item-row">
                                            <div className="soc-item-left">
                                                <span className="soc-item-name">{item.foodname}</span>
                                                <span className="soc-item-qty">×{item.quantity}</span>
                                            </div>
                                            <span className="soc-item-total">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                {order.paymentmethod === 0 && (
                                    <button className="main-btn width-80 mx-auto mtb-10" style={{ display: 'flex' }} onClick={() => navigate(order.servicetype === 1 ? `/dine-in/billing/${order._id}?type=0` : `/take-away/billing/${order._id}`)}>
                                        <span className="material-symbols-outlined">payments</span>
                                        Complete Payment
                                    </button>
                                )}
                                {order.adminstatus === 2 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <button className="main-btn width-40 mx-auto mtb-10" style={{ display: 'flex' }} onClick={() => navigate(`/orderdetails/${order._id}`)}>
                                            Details
                                        </button>
                                        <button className="main-btn width-40 mx-auto mtb-10" style={{ display: 'flex' }} onClick={() => window.open(`${order.bill}`, '_blank')}>
                                            View Bill
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderFavItems = () => (
        <div className="sidebar-scroll-box">
            {loadingData ? (
                <div className="sidebar-loader-wrap">{Methods.showLoader()}</div>
            ) : favoriteItems.length === 0 ? (
                <div className="sidebar-empty-state">
                    <span className="material-symbols-outlined empty-icon">favorite</span>
                    <p>Your wishlist is empty</p>
                    <button className="main-btn" onClick={() => { setIsSidebarOpen(false); navigate('/view-menu'); }}>Discover Menu</button>
                </div>
            ) : (
                <div className="sidebar-fav-grid">
                    {favoriteItems.map((item, index) => (
                        <div key={index} className="sidebar-fav-card">
                            <div className="fav-card-visual">
                                <img src={item.url} alt={item.name} />
                            </div>
                            <div className="fav-card-meta">
                                <h3>{item.name}</h3>
                                <div className="meta-footer">
                                    <span className="fav-price">₹{item.price}</span>
                                    <button className="fav-delete-btn" onClick={() => handleRemoveFavorite(item)}>
                                        <span className="material-symbols-outlined fs-20">heart_minus</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <nav className={`navbar-wrapper user-not-select ${isScrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    <div className="brand" onClick={() => navigate("/home")}>
                        <img src={Config.moonlightcafelogosquare} alt="Logo" className="nav-logo" />
                        <img src={Config.moonlightcafetext} alt="Logo" className="nav-text" />
                    </div>

                    <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                        <Link to="/home" className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
                        <Link to="/view-menu" className={`nav-item ${location.pathname === '/view-menu' ? 'active' : ''}`}>Menu</Link>
                        <Link to="/aboutus" className={`nav-item ${location.pathname === '/aboutus' ? 'active' : ''}`}>About</Link>
                        <Link to="/services" className={`nav-item ${location.pathname === '/services' ? 'active' : ''}`}>Services</Link>
                        <Link to="/contactus" className={`nav-item ${location.pathname === '/contactus' ? 'active' : ''}`}>Contact</Link>
                    </div>

                    <div className="nav-right">
                        <div className="user-section" ref={popupRef}>
                            <div className="account-trigger" onClick={() => {
                                if (customerdata.status === 200) setPopupOpen(!popupOpen);
                                else navigate('/login');
                            }}>
                                <span className="material-symbols-outlined">account_circle</span>
                                <span className="user-display-name">{name}</span>
                            </div>
                            {popupOpen && (
                                <div className="profile-dropdown">
                                    <div className="profile-drop-header mb-5">
                                        <h3 className="profile-name">{name}</h3>
                                        {/* <h4 className="profile-role">Customer</h4> */}
                                    </div>
                                    <button className="drop-item" onClick={() => { setPopupOpen(false); navigate(`/user/profile/${userId}`); }}>
                                        <span className="material-symbols-outlined drop-item-icon">person</span> Profile Settings
                                    </button>
                                    <button className="drop-item" onClick={() => { setPopupOpen(false); setIsPwdModalOpen(true); }}>
                                        <span className="material-symbols-outlined drop-item-icon">lock_reset</span> Change Password
                                    </button>
                                    <button className="drop-item" onClick={fetchPreviousOrders}>
                                        <span className="material-symbols-outlined drop-item-icon">receipt_long</span> Orders
                                    </button>
                                    <button className="drop-item" onClick={fetchFavoriteItems}>
                                        <span className="material-symbols-outlined drop-item-icon">favorite</span> Favorites
                                    </button>
                                    <div className="drop-separator"></div>
                                    <button className="drop-item logout-btn" onClick={() => { setPopupOpen(false); navigate(`/user/logout/${userId}`); }}>
                                        <span className="material-symbols-outlined drop-item-icon">logout</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
            </nav>

            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <div className={`sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
                <button
                    className="sidebar-close-btn"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <span className="material-symbols-outlined fs-20">close</span>
                </button>

                <h3>{sidebarType === 'orders' ? 'Order History' : 'Favorites'}</h3>

                <div className="sidebar-form sidebar-scrollable">
                    {sidebarType === 'orders' ? renderOldOrders() : renderFavItems()}
                </div>
            </div>

            {/* GLOBAL PASSWORD MODAL */}
            {isPwdModalOpen && (
                <div className="modal-overlay-modern user-not-select" onClick={() => setIsPwdModalOpen(false)}>
                    <div className="pwd-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <h3>Change Password</h3>
                        </div>

                        <div className="modal-body-content">
                            <div className="modern-field">
                                <label>Current Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.old ? "text" : "password"}
                                        value={pwdData.old}
                                        onChange={e => setPwdData({ ...pwdData, old: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, old: !pwdVisible.old })}>
                                        {pwdVisible.old ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>New Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.new ? "text" : "password"}
                                        value={pwdData.new}
                                        onChange={e => setPwdData({ ...pwdData, new: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, new: !pwdVisible.new })}>
                                        {pwdVisible.new ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modern-field">
                                <label>Confirm Password</label>
                                <div className="pwd-input-wrapper">
                                    <input
                                        type={pwdVisible.confirm ? "text" : "password"}
                                        value={pwdData.confirm}
                                        onChange={e => setPwdData({ ...pwdData, confirm: e.target.value })}
                                    />
                                    <span className="material-symbols-outlined toggle-eye" onClick={() => setPwdVisible({ ...pwdVisible, confirm: !pwdVisible.confirm })}>
                                        {pwdVisible.confirm ? 'visibility' : 'visibility_off'}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions-admin-style">
                                <button className="main-btn" onClick={handleUpdatePassword} disabled={pwdLoading}>
                                    {pwdLoading ? "Updating..." : "Update Password"}
                                </button>
                                <button className="main-cancle-btn" onClick={() => setIsPwdModalOpen(false)} disabled={pwdLoading}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Methods.renderPopup should be outside but within the fragment */}
            {Methods.renderPopup(popup, () => Methods.hidePopup(setPopup))}
        </>
    );
});

export default Navbar;
