import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const ModalPaymentPopup = ({ trackId, onCancel }) => {
  const onClose = onCancel;
  const [paymentData, setPaymentData] = useState(null);

  const initiatePayment = async () => {
    try {
      const res = await axiosInstance.post('/api/courses/payment/initiate/', { track_id: trackId });
      setPaymentData(res.data);
    } catch (err) {
      const errorMsg = err?.response?.data?.error;
      toast.error(errorMsg || 'Failed to initiate payment.');
      onClose();
    }
  };

  const verifyPayment = async (response) => {
    if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
      toast.error("Missing payment details. Verification aborted.");
      return;
    }

    try {
      const res = await axiosInstance.post('/api/courses/payment/verify/', {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (res.data.status === 'success') {
        toast.success(res.data.message);
        window.location.href = '/my-learning';
      } else {
        toast.error(res.data.message || 'Payment verification failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment verification failed.');
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
      modal: { ondismiss: onClose },
      prefill: { name: paymentData.user_name, email: paymentData.user_email },
      theme: { color: '#199fcc' },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => { initiatePayment(); }, []);
  useEffect(() => { if (paymentData) handleRazorpay(); }, [paymentData]);

  return null;
};

export default ModalPaymentPopup;
