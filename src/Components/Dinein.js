import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Dinein.css";
import _Config from '../Config.js';
import _Methods from '../Methods.js';
import { useNavigate } from "react-router-dom";

const Config = new _Config();
const Methods = new _Methods();
const backendurl = Config.backendurl;

export default function Dinein() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  // Refs to store each table element for IntersectionObserver
  const tableRefs = useRef([]);

  useEffect(() => {
    const loginCheck = Methods.checkLoginStatus();
    const tableCheck = Methods.checkSelectedTable();

    if (loginCheck.status !== 200) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }

    if (tableCheck.status === 200) {
      navigate(`/dine-in/menu/${tableCheck.data.redirecturl}`);
      return;
    }

    const fetchTables = async () => {
      try {
        const response = await axios.post(`${backendurl}free/tables`);
        setTables(response.data.data);
      } catch (err) {
        console.error("Error fetching tables:", err);
        setError("Failed to fetch tables.");
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [navigate]);

  // Intersection Observer to add 'visible' class when table scrolls into view
  useEffect(() => {
    tableRefs.current = tableRefs.current.slice(0, tables.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      {
        threshold: 0.1, // 10% visible triggers animation
      }
    );

    tableRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [tables]);

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  };

  const handleTableClick = (table) => {
    if (table.isavailable === 0) {
      setModalAction({ type: "booked", table });
      setModalVisible(true);
      return;
    }
    setModalAction({ type: "select", table });
    setModalVisible(true);
  };

  const handleModalConfirm = () => {
    const { table } = modalAction;

    axios.post(`${backendurl}book/table`, { _id: table._id })
      .then(() => {
        const expirationTime = new Date().getTime() + 2 * 60 * 60 * 1000;
        setCookie(
          "selectedTable",
          JSON.stringify({
            id: table._id,
            table_no: table.number,
            redirecturl: table.url,
            expiresAt: expirationTime,
          }),
          2
        );
        window.location.href = `/dine-in/menu/${table.url}`;
      })
      .catch((err) => {
        console.error("Error booking table:", err);
        setError("Failed to book the table. Please try again.");
      });

    setModalVisible(false);
  };

  const handleModalNo = () => {
    setModalVisible(false);
  };

  return (
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
              style={{ animationDelay: `${index * 100}ms` }}
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
                  className={`table-item ${
                    table.isavailable === 0 ? "not-available" : ""
                  }`}
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

      {modalVisible && modalAction?.type === "booked" && (
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
      )}

      {modalVisible && modalAction?.type === "select" && (
        <div className="modal-overlay">
          <div className="modal-content-select">
            <span className="material-symbols-outlined modal-icon">restaurant</span>
            <p className="modal-content-select-label">
              Please confirm your selection of Table No: {modalAction.table.number}.
            </p>
            <p className="note">Note: This selection is final and cannot be changed later.</p>
            <div className="modal-buttons">
              <button onClick={handleModalConfirm}>Yes</button>
              <button onClick={handleModalNo}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
