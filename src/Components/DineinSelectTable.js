import { API as SharedAPI, Method as SharedMethod } from "../config/Init.js";
import React, { useEffect, useState, useRef } from "react";
import "./DineinSelectTable.css";
import { useNavigate } from "react-router-dom";
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
      <div className="viewtable-container">
        <header className="table-header">
          <h2 className="dine-in-heading">Select Table</h2>
          <p className="dine-in-note">Note: Please select your own table.</p>
          <hr />
        </header>

        {loading ? (
          <div className="center-loader">{Methods.showLoader()}</div>
        ) : error ? (
          <>
            <div className="center-loader">{Methods.showLoader()}</div>
            <p className="dinein-table-error">{error}</p>
          </>
        ) : tables.length > 0 ? (
          <div className="table-content">
            {tables.map((table, index) => (
              <section
                key={table._id}
                ref={(el) => (tableRefs.current[index] = el)}
                className="table-grid"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >

                <a
                  href="#!"
                  className="table-link"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTableClick(table);
                  }}
                >
                  <div
                    className={`table-item ${table.isavailable === 0 ? "not-available" : "available"}`}
                  >
                    <div className="table-content-wrapper">
                      <h3 className="table-title">Table {table.number}</h3>
                      <p className="table-availability">
                        {table.isavailable === 1 ? "Available" : "Not Available"}
                      </p>
                    </div>
                  </div>
                </a>
              </section>
            ))}
          </div>
        ) : (
          <p className="freetables">No available tables.</p>
        )}

      </div>
      {/* Booked Table Modal */}
      {/* {modalVisible && modalAction?.type === "booked" && (
        <div className="modal-overlay">
          <div className="modal-content-booked">
            <span className="material-symbols-outlined modal-icon-booked">no_meals</span>
            <p className="modal-content-booked-label">
              This table is already booked, please select your own table
            </p>
            <div className="modal-buttons">
              <button onClick={handleModalNo}>Okay</button>
            </div>
          </div>
        </div>
      )} */}

      {modalVisible && modalAction?.type === "booked" && (
        <div className="modal-overlay user-not-select">
          <div className={`modal-content-select width-40 alert-modal ${isAnimatingAlertOut ? "fade-out" : ""}`}>
            <span className="material-symbols-outlined modal-icon required  xfs-50">no_meals</span>
            <h3 className="modal-title fs-25 required">Are you sure?</h3>
            <p className="required fs-18">The Table You are Select is Already Booked.</p>
            <div>
              <button className="main-cancle-btn mt-10 plr-40" onClick={handleModalNo}>Okay</button>
            </div>
          </div>
        </div>
      )}

      {modalVisible && modalAction?.type === "select" && (
        <div className="modal-overlay user-not-select">
          <div className={`modal-content-select width-40 alert-modal ${isAnimatingAlertOut ? "fade-out" : ""}`}>
            <span className="material-symbols-outlined modal-icon fs-50">restaurant</span>
            <h3 className="modal-title fs-25 ">Are you sure?</h3>
            <p className="main-color fs-20">
              Please confirm your selection of Table No: {modalAction.table.number}.
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

}
