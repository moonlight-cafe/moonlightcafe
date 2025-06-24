import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./PaymentPage.css";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [payableAmount, setPayableAmount] = useState(0);
  const [totalWithTax, setTotalWithTax] = useState(0);
  const [tableNo, setTableNo] = useState(null);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    const cartCookie = Cookies.get("addtocart");
    if (cartCookie) {
      const parsedCookie = JSON.parse(cartCookie);
      const amount = parseFloat(parsedCookie["payable amount"]) || 0;
      setPayableAmount(amount);

      const cgstRate = 0.09;
      const sgstRate = 0.09; 

      const cgst = amount * cgstRate;
      const sgst = amount * sgstRate;
      const total = amount + cgst + sgst;

      setTotalWithTax(total);
    }

    const customerdata = Cookies.get("customerdata");
    if (customerdata) {
      const parsedData = JSON.parse(customerdata);
      setTableNo(parsedData.tableNo);
      setCustomerName(parsedData.name);
    }
  }, []);

  const handleConfirmPayment = () => {
    if (tableNo && customerName) {
      fetch("http://localhost:5010/api/move-to-received-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table_no: tableNo, customer_name: customerName }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Data moved successfully!") {
            navigate("/thank_you");
          } else {
            alert("Error processing payment: " + data.error);
          }
        })
        .catch((error) => {
          alert("Error processing payment: " + error.message);
        });
    } else {
      alert("No table number or customer name found.");
    }
  };

  return (
    <div className="payment-page-container">
      <h2>Payment Page</h2>
      <h3>Total Amount: {payableAmount.toFixed(2)} ₹/Rs</h3>
      <h4>CGST (9%): {(payableAmount * 0.09).toFixed(2)} ₹/Rs</h4>
      <h4>SGST (9%): {(payableAmount * 0.09).toFixed(2)} ₹/Rs</h4>
      <h3>Total with Tax: {totalWithTax.toFixed(2)} ₹/Rs</h3>
      <button className="confirm-payment-button" onClick={handleConfirmPayment}>
        Confirm Payment
      </button>
    </div>
  );
}