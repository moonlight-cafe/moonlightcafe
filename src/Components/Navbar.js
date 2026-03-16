import { API as SharedAPI, Method as SharedMethod, Config as SharedConfig } from "../config/Init.js";
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';


const Config = SharedConfig;
const Methods = SharedMethod;
const BackendAPIs = SharedAPI;
const navcafeimg = Config.moonlightcafelogo;

export default function Navbar() {
  const customerdata = Methods.checkLoginStatus();
  const name = customerdata.data.name || "Guest User";

  const [menuOpen, setMenuOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarType, setSidebarType] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingPastOrders, setLoadingPastOrders] = useState(false);
  const [sidebarAccordion, setSidebarAccordion] = useState(null);

  const navigate = useNavigate();
  const popupRef = useRef(null);

  const toggleMenu = () => Methods.toggleState(setMenuOpen);
  const toggleAccordion = (index) => setSidebarAccordion((prev) => (prev === index ? null : index));

  const handleNavClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    setMenuOpen(false);
    setPopupOpen(false);
  };

  const handleLoginIconClick = (e) => {
    e.preventDefault();
    if (customerdata.status == 200) {
      setPopupOpen((prev) => !prev);
    } else {
      setMenuOpen(false);
      navigate('/login');
    }
  };

  let userId = null;
  try {
    userId = customerdata.data?._id || null;
  } catch {
    userId = null;
  }

  const handleProfileClick = () => {
    setPopupOpen(false);
    if (userId) navigate(`/user/profile/${userId}`);
    else navigate('/login');
    setMenuOpen(false);
  };

  const fetchPreviousOrders = async () => {
    try {
      setLoadingPastOrders(true);
      setSidebarType('orders');
      Methods.toggleSidebar(setIsSidebarOpen, true);
      const response = await BackendAPIs.FetchPastOrders({ customerid: customerdata.data._id, servicetype: [1, 2] });
      setPreviousOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching previous orders:', error);
    } finally {
      setLoadingPastOrders(false);
    }
  };

  const fetchFavoriteItems = async () => {
    try {
      setLoadingFavorites(true);
      setSidebarType('favorites');
      Methods.toggleSidebar(setIsSidebarOpen, true);
      const response = await BackendAPIs.FetchFavItems(customerdata.data._id);
      setFavoriteItems(response.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleLogoutClick = () => {
    setPopupOpen(false);
    navigate(userId ? `/user/logout/${userId}` : '/home');
    setMenuOpen(false);
  };

  const handleRemoveFavorite = async (item, customerId, refreshFavorites) => {
    try {
      const response = await BackendAPIs.RemoveFavItems(customerId, item._id, item.name);
      if (response.status === 200) {
        const updatedFavs = await BackendAPIs.FetchFavItems(customerId);
        refreshFavorites(updatedFavs.data);
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const handleViewBill = (selectedOrder) => {
    if (selectedOrder.bill) {
      window.open(selectedOrder.bill, "_blank");
    }
  };

  const handlePayBill = (selectedOrder) => {
    navigate(selectedOrder.servicetype === 1 ? `/dine-in/billing/${selectedOrder._id}?type=0` : `/take-away/billing/${selectedOrder._id}`)
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
            <div className="accordion-header" onClick={() => toggleAccordion(index)}>
              <span className="order-placed-text"><strong>{Methods.getServiceType(order.servicetype)}</strong> - {Methods.formatReadableDate(order.createdAt)}</span>
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
                      {order.data?.map((item, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{item.foodname}</td>
                          <td>
                            <img src={item.imageurl} alt={item.foodname} className="food-img" />
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
                <p>Total: ₹{order.totalamount}</p>
                {order.paymentmethod === 0 ? (
                  <p className='pendingbatch fs-15'>{order.paymentmode}</p>
                ) : (
                  <p className='successbatch fs-20'>{order.paymentmode}</p>
                )}

                {order.paymentmethod === 0 ? (
                  <button className='main-btn' onClick={() => handlePayBill(order)}>
                    Pay bill
                  </button>

                ) : (
                  <button className='main-btn' onClick={() => handleViewBill(order)}>
                    View bill
                  </button>
                )}

              </div>
            </div>
          </div>
        ))
      )}
    </>
  );

  const renderFavItems = () => (
    <>
      <h2 className="sidebar-heading">Favourite Items</h2>

      {loadingFavorites ? (
        Methods.showLoader()
      ) : favoriteItems.length === 0 ? (
        <>
          <div className="notfoundiimg">
            <img src={Config.ordernotfoundimg} alt="No Favorites" className="notfound-image" />
          </div>
          <p className="no-orders-text">No favorites found.</p>
          <button className="main-btn mt-20" onClick={() => (window.location.href = "/view-menu")}>Add Favorite Food</button>
        </>
      ) : (
        <div className="favorites-list">
          {favoriteItems.map((item, index) => (
            <div key={index} className="favorite-card fancy-card">
              <img src={item.url} alt={item.name} className="food-avatar large" />
              <div className="favorite-info detailed">
                <div className="info-header">
                  <p className="food-name">{item.name}</p>
                  <p className="food-price">₹{item.price}</p>
                </div>
                <p className="food-description">{item.description}</p>
                <div className="card-actions">
                  <button className="add-to-cart-btn">
                    <span className="material-symbols-outlined">add_shopping_cart</span> Add to Cart
                  </button>
                  <button
                    className="fav-button active"
                    onClick={() => handleRemoveFavorite(item, userId, setFavoriteItems)}
                    title="Remove Favorite"
                  >
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="navbarcontainer">
      <img src={navcafeimg} alt="Moonlight Cafe" className="navbarimg" />

      <div className="nav-actions">
        <div className="menu-icon" onClick={toggleMenu}>
          {menuOpen ? (
            <i className="fa-solid fa-xmark fa-xl" style={{ color: '#47d9a8' }}></i>
          ) : (
            <i className="fa-solid fa-bars fa-xl" style={{ color: '#47d9a8' }}></i>
          )}
        </div>

        <nav className={`navlinks ${menuOpen ? 'open' : 'close'}`}>
          <a href="/home" className="navlink" onClick={(e) => handleNavClick(e, '/home')}>Home</a>
          <a href="/aboutus" className="navlink" onClick={(e) => handleNavClick(e, '/aboutus')}>About</a>
          <a href="/services" className="navlink" onClick={(e) => handleNavClick(e, '/services')}>Services</a>
          <a href="/contactus" className="navlink" onClick={(e) => handleNavClick(e, '/contactus')}>Contact Us</a>
          <p className="navlink-p">{name}</p>
        </nav>

        <a href="/login" className="navlink-icon" onClick={handleLoginIconClick} style={{ position: 'relative' }}>
          <span className="material-symbols-outlined white-icon">account_circle</span>

          {popupOpen && (
            <div ref={popupRef} className={`profile-popup ${popupOpen ? 'show' : 'hide'}`}>
              <button onClick={handleProfileClick} className="popup-btn profile-btn">
                <span className="material-symbols-outlined">person</span> Profile
              </button>
              <button onClick={fetchPreviousOrders} className="popup-btn profile-btn">
                <span className="material-symbols-outlined">receipt_long</span> Orders
              </button>
              <button onClick={fetchFavoriteItems} className="popup-btn profile-btn">
                <span className="material-symbols-outlined">favorite</span> Favourite
              </button>
              <button onClick={handleLogoutClick} className="popup-btn logout-btn">
                <span className="material-symbols-outlined">logout</span> Logout
              </button>
            </div>
          )}
        </a>

        {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}></div>
        )}

        <div className={`sidebar-history-panel ${isSidebarOpen ? 'open' : ''}`}>
          <button className="sidebar-close-btn" onClick={() => Methods.toggleSidebar(setIsSidebarOpen, false)}>
            <span className="material-symbols-outlined">close</span>
          </button>

          {sidebarType === "favorites" ? renderFavItems() : renderOldOrders()}
        </div>
      </div>
    </div>
  );
}
