import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dinein.css";
import _Config from '../Config.js';

const Config = new _Config();
const backendurl = Config.backendurl;

export default function Dinein() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
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
  }, []);

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
      .then((response) => {
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

  const availableTables = tables.filter((t) => t.isavailable === 1);

  return (
    <div className="viewtable-container">
      <header className="table-header">
        <h2 className="dine-in-heading">Select Table</h2>
        <p className="dine-in-note">Note: Please select your own table.</p>
        <hr />
      </header>
      <div className="table-content">
        {loading ? (
          <p>Loading tables...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : availableTables.length > 0 ? (
          tables.map((table) => (
            <section key={table._id} className="table-grid">
              <a
                href="#!"
                className="table-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleTableClick(table);
                }}
              >
                <div className={`table-item ${table.isavailable === 0 ? "not-available" : ""}`}>
                  <div className="table-content-wrapper">
                    <h3 className="table-title">Table {table.number}</h3>
                    <p className="table-availability">
                      {table.isavailable === 1 ? "Available" : "Not Available"}
                    </p>
                  </div>
                </div>
              </a>
            </section>
          ))
        ) : (
          <p className="freetables">No available tables.</p>
        )}
      </div>

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
