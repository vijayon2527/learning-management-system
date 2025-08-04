// ModalPaymentPopup.js
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const ModalPaymentPopup = ({ trackId, onClose }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const initiatePayment = async () => {
    try {
      const res = await axiosInstance.post('/api/courses/payment/initiate/', {
        track_id: trackId,
      });
      setPaymentData(res.data);
    } catch (err) {
      const errorMsg = err?.response?.data?.error;
      if (errorMsg === 'You have already enrolled in this track.') {
        alert("✅ You're already enrolled in this track.");
        onClose();
      } else {
        alert(`❌ ${errorMsg || 'Failed to initiate payment.'}`);
        setError(errorMsg || 'Failed to initiate payment.');
        onClose();
      }
    }
  };

  const verifyPayment = async (response) => {
    try {
      const res = await axiosInstance.post('/api/courses/payment/verify/', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (res.data.status === 'success') {
        alert('✅ Payment successful!');
        window.location.href = '/my-learning';
      } else {
        alert('❌ Payment verification failed.');
        setError('Payment verification failed.');
      }
    } catch (err) {
      alert('❌ Payment verification failed.');
    }
  };

  const handleRazorpay = () => {
    if (!paymentData) return;

    const options = {
      key: paymentData.razorpay_merchant_key,
      amount: paymentData.razorpay_amount,
      currency: paymentData.currency,
      name: 'Digital Beans',
      description: paymentData.track_name,
      order_id: paymentData.razorpay_order_id,
      handler: function (response) {
        verifyPayment(response);
      },
      modal: {
        ondismiss: function () {
          alert('❌ Payment cancelled.');
          onClose();
        },
      },
      prefill: {
        name: paymentData.user_name,
        email: paymentData.user_email,
      },
      theme: { color: '#199fcc' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    initiatePayment();
  }, []);

  useEffect(() => {
    if (paymentData) {
      handleRazorpay();
    }
  }, [paymentData]);

  return null; // No UI, just triggers Razorpay popup
};

export default ModalPaymentPopup;
