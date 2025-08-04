// src/pages/student/PurchaseHistory.js

import React, { useEffect, useState } from 'react';
import StudentLayout from './StudentLayout';
import axiosInstance from '../../../utils/axiosInstance';

const PurchaseHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/courses/purchase-history/')
      .then(res => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching purchase history", err);
        setLoading(false);
      });
  }, []);

  return (
    <StudentLayout>
      <h2>Purchase History</h2>
      {loading ? (
        <p>Loading...</p>
      ) : payments.length === 0 ? (
        <p>No purchases found.</p>
      ) : (
        <div className="purchase-list">
          {payments.map((payment) => (
            <div key={payment.id} className="purchase-item">
              <h4>{payment.course_name || 'Unknown Course'}</h4>
              <p>Amount: ₹{payment.amount}</p>
              <p>Status: {payment.status}</p>
              <p>Order: {payment.order_number}</p>
              <p>Date: {new Date(payment.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
};

export default PurchaseHistory;
