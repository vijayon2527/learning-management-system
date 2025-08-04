import React, { useEffect, useState } from 'react';
import StudentLayout from './StudentLayout';
import axiosInstance from '../../../utils/axiosInstance';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import './ReferFriend.css';

const ReferFriend = () => {
  const [referralCode, setReferralCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/users/referral/')
      .then(response => {
        setReferralCode(response.data.referral_code);
      })
      .catch(error => {
        console.error('Failed to load referral code', error);
      });
  }, []);

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopySuccess('Copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 3000);
      })
      .catch(() => {
        setCopySuccess('Failed to copy!');
        setTimeout(() => setCopySuccess(''), 3000);
      });
  };

  return (
    <StudentLayout>
      <div className="refer-container">
        <h2 className="refer-title">🎁 Refer a Friend to AGPLMS</h2>
        <p className="refer-subtitle">
          AGPLMS (Advanced Global Platform for Learning Management System) is a modern LMS designed for students to enhance their skills, track progress, and access top-quality courses.
        </p>

        <div className="about-referral">
          <h3>How It Works:</h3>
          <ul>
            <li>Share your referral link below with your friends.</li>
            <li>When your friend registers using your link, your account will be credited with reward points.</li>
            <li>Use points to unlock premium features, certifications, or discounts!</li>
          </ul>
        </div>

        {referralCode ? (
          <div className="refer-box">
            <h3>Your Referral Code: <span className="ref-code-highlight">{referralCode}</span></h3>
            <label>Your Unique Referral Link</label>
            <div className="refer-input-group">
              <input type="text" value={referralLink} readOnly className="refer-input" />
              <button className="refer-copy-btn" onClick={copyToClipboard}>
                <FaCopy style={{ marginRight: '6px' }} />
                Copy
              </button>
            </div>
            {copySuccess && (
              <p className="refer-success"><FaCheckCircle style={{ marginRight: '5px' }} /> {copySuccess}</p>
            )}
          </div>
        ) : (
          <p className="refer-loading">Loading your referral link...</p>
        )}
      </div>
    </StudentLayout>
  );
};

export default ReferFriend;
