import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import "./DineinSelectTable.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.js";
import AOS from 'aos';
import 'aos/dist/aos.css';

const Methods = SharedMethod;
const BackendAPIs = SharedAPI;

export default function DineinSelectTable() {
  const customerdata = Methods.checkLoginStatus()
  const tabledata = Methods.checkSelectedTable();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [popup, setPopup] = useState({ message: "", type: "", visible: false });
  const [isAnimatingAlertOut, setIsAnimatingAlertOut] = useState(false);
  const popupTimer = useRef(null);

  const showPopup = (message, type = "error") => {
    Methods.showPopup(setPopup, popupTimer, message, type);
  };

  const tableRefs = useRef([]);
  const fetchTables = async () => {
    try {
      const response = await BackendAPIs.FreeTables()
      setTables(response.data);
    } catch (err) {
      console.error("Error fetching tables:", err);
      setError("Failed to fetch tables.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (customerdata.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (tabledata.status === 200) {
      navigate(`/dine-in/menu/${tabledata.data.id}`);
      return;
    }

    fetchTables();

    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
    });
  }, [navigate]);

  useEffect(() => {
    tableRefs.current = tableRefs.current.slice(0, tables.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    tableRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [tables])

  const handleTableClick = (table) => {
    if (table.isavailable === 0) {
      setModalAction({ type: "booked", table });
      setModalVisible(true);
      return;
    }
    setModalAction({ type: "select", table });
    setModalVisible(true);
  };

  const handleModalConfirm = async () => {
    const { table } = modalAction;

    const selecttbl = await BackendAPIs.SelectTable(table._id, customerdata.data._id, customerdata.data.name, table.number, table.url);

    if (selecttbl.status === 200) {
      setIsAnimatingAlertOut(true);
      setTimeout(() => {
        setModalVisible(false);
        setIsAnimatingAlertOut(false)
      }, 300);
      window.location.href = `/dine-in/menu/${table._id}`;
    }
    else {
      showPopup(selecttbl.message || "Invalid credentials", "error");
      const response = await BackendAPIs.FreeTables()
      setTables(response.data);
    }
    setIsAnimatingAlertOut(true);
    setTimeout(() => {
      setModalVisible(false);
      setIsAnimatingAlertOut(false)
    }, 300);
  };

  const handleModalNo = () => {
    setIsAnimatingAlertOut(true);
    setTimeout(() => {
      setModalVisible(false);
      setIsAnimatingAlertOut(false)
    }, 300);
  };

  return (
    <>
      <div className="dinein-table-page-wrapper user-not-select">
        <Navbar />

        <header className="dinein-table-hero">
          <div className="dinein-hero-content">
            <h2 className="services-title fs-30 main-color m-0">
              <span className="material-symbols-outlined fs-50">restaurant</span>
              Dine In
            </h2>
            <h1 className="dinein-title">Choose Your Table</h1>
            <p className="dinein-subtitle">Please select the table you are currently seated at to begin your orders.</p>
          </div>
        </header>

        {loading ? (
          Methods.showLoader()
        ) : error ? (
          <>
            {Methods.showLoader()}
            <p className="dinein-table-error">{error}</p>
          </>
        ) : tables.length > 0 ? (
          <main className="tables-grid-section">
            <div className="tables-container">
              {tables.map((table, index) => (
                <div
                  key={table._id}
                  ref={(el) => (tableRefs.current[index] = el)}
                  className={`table-premium-card ${table.isavailable === 0 ? "booked" : "available"}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  onClick={() => handleTableClick(table)}
                >
                  <div className="table-card-inner">
                    <div className="table-visual-side">
                      <span className="material-symbols-outlined table-main-icon">
                        {table.isavailable === 1 ? "table_restaurant" : "event_busy"}
                      </span>
                    </div>
                    <div className="table-info-side">
                      <span className="table-label">Table</span>
                      <span className="table-number-text">{table.number}</span>
                      <div className={`status-pill ${table.isavailable === 1 ? "free" : "busy"}`}>
                        {table.isavailable === 1 ? "Available" : "Booked"}
                      </div>
                    </div>
                  </div>
                  <div className="card-ambient-glow"></div>
                </div>
              ))}
            </div>
          </main>
        ) : (
          <div className="no-tables-state">
            <span className="material-symbols-outlined">event_busy</span>
            <p>We're fully booked at the moment. Please wait for a few minutes or choose Take Away.</p>
            <button className="goto-home-btn" onClick={() => navigate('/home')}>Return to Home</button>
          </div>
        )}
      </div>
      {modalVisible && modalAction?.type === "booked" && (
        <div className={`modal-overlay user-not-select ${isAnimatingAlertOut ? "fade-out" : ""}`}>
          <div className={`modal-content-select width-40 alert-modal ${isAnimatingAlertOut ? "fade-out" : ""}`}>
            <span className="material-symbols-outlined modal-icon required fs-50">no_meals</span>
            <h3 className="modal-title fs-25 required">Are you sure?</h3>
            <p className="modal-description fs-20 required">The Table You are Select is Already Booked.</p>
            <p className="note required fs-20">Please select your own table.</p>
            <div className="mt-20">
              <button className="main-cancle-btn plr-40" onClick={handleModalNo}>Okay</button>
            </div>
          </div>
        </div>
      )}

      {modalVisible && modalAction?.type === "select" && (
        <div className={`modal-overlay user-not-select ${isAnimatingAlertOut ? "fade-out" : ""}`}>
          <div className={`modal-content-select width-40 alert-modal ${isAnimatingAlertOut ? "fade-out" : ""}`}>
            <span className="material-symbols-outlined modal-icon fs-50">restaurant</span>
            <h3 className="modal-title fs-25">Are you sure?</h3>
            <p className="main-color fs-20">
              Please confirm your selection of Table No: {modalAction.table.number}.
            </p>
            <p className="required fs-18">This action cannot be undone.</p>
            <div className="mt-20">
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

}
