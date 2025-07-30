import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import Header from '../layout/partials/Header';
import Footer from '../layout/partials/Footer';

const CombinedPaymentComponent = ({ trackId }) => {
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

  const initiatePayment = async () => {
    try {
      const res = await axiosInstance.post('/api/courses/payment/initiate/', {
        track_id: trackId,
      });
      setPaymentData(res.data);
      setError(null);
    } catch (err) {
      const errorMsg = err?.response?.data?.error;

      if (errorMsg === 'You have already enrolled in this track.') {
        alert("✅ You're already enrolled in this track.");
      } else {
        alert(`❌ ${errorMsg || 'Failed to initiate payment.'}`);
        setError(errorMsg || 'Failed to initiate payment. Please try again.');
      }
      console.error('Initiation error:', err);
    }
  };

  useEffect(() => {
    initiatePayment();
  }, [trackId]);

  const verifyPayment = async (response) => {
    try {
      const res = await axiosInstance.post('/api/courses/payment/verify/', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (res.data.status === 'success') {
        alert('✅ Payment successful!');
        navigate('/my-learning');  // Redirect after success
      } else {
        alert('❌ Payment verification failed.');
        setError('Payment verification failed.');
      }
    } catch (err) {
      alert('❌ Payment verification failed.');
      setError('Payment verification failed.');
      console.error('Verification error:', err);
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
        verifyPayment({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          alert('❌ Payment cancelled.');
        },
      },
      prefill: {
        name: paymentData.user_name,
        email: paymentData.user_email,
      },
      theme: {
        color: '#F37254',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!paymentData && !error) {
    return (
      <>
        <Header />
        <div className="text-center mt-5">Loading Payment Details...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Make Payment</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow">
              <img
                src="https://www.learningroutes.in/_next/image?url=https%3A%2F%2Faskusedu.com%2Fblogdashboard%2Fwp-content%2Fuploads%2F2025%2F06%2FOnline-Study.webp&w=1080&q=75"
                className="card-img-top"
                alt="Program"
              />
              <div className="card-body">
                <h5 className="card-title">🚀 Advanced Learning Courses</h5>
                <ul className="list-group list-group-flush mb-3">
                  <li className="list-group-item">✔️ Expert Faculty & Mentors</li>
                  <li className="list-group-item">✔️ Certificate on Completion</li>
                  <li className="list-group-item">✔️ Internship Opportunities</li>
                  <li className="list-group-item">✔️ Lifetime Access to Materials</li>
                  <li className="list-group-item">✔️ Personalized Doubt Clearing</li>
                  <li className="list-group-item">✔️ Resume & Interview Prep</li>
                </ul>
                <p>
                  <strong>Fee:</strong> ₹
                  {paymentData?.razorpay_display_amount ?? 'Loading...'} (incl. GST)
                </p>
                <p>
                  <strong>Duration:</strong> 15 Days
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card shadow p-4">
              <h5 className="text-center">💳 Pay Now</h5>
              <p className="text-center">Click below to complete your payment.</p>

              <button
                onClick={handleRazorpay}
                disabled={!paymentData}
                className="btn btn-primary btn-lg w-100 mt-3"
              >
                Pay ₹{paymentData?.razorpay_display_amount ?? '...'}
              </button>

              <p className="mt-3 text-muted text-center">
                <small>Redirects to Razorpay secure gateway</small>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CombinedPaymentComponent;
