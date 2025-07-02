import React from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import './LearningTools.css';

const LearningTools = () => {
  return (
      <div className="learning-container">
      {/* Learning Reminders Section */}
      <h2 className="remainder-title">Learning reminders</h2>
      <p className="section-subtitle">
        Set up push notifications or calendar events to stay on track for your learning goals.
      </p>
      <Button className="add-reminder-btn">
        <FaPlus className="icon" /> Add a learning reminder
      </Button>

      {/* Mobile Notifications Section */}
      <h3 className="section-title mt-4">Mobile notifications</h3>
      <p className="section-subtitle">
        Receive learning reminders on your mobile device.
      </p>
      <p className="bold-text">Text me a link to download the app</p>

      <div className="mobile-notification">
        {/* App Icon */}
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Udemy_logo.svg/600px-Udemy_logo.svg.png" alt="App Icon" className="app-icon" />
        
        {/* Input Section */}
        <div className="input-container">
          <InputGroup className="mb-2">
            <Form.Select className="country-dropdown">
              <option>+1 (United States)</option>
              <option>+91 (India)</option>
              <option>+44 (United Kingdom)</option>
              <option>+61 (Australia)</option>
            </Form.Select>
          </InputGroup>

          <InputGroup>
            <Form.Control type="tel" placeholder="123 456 7890" className="phone-input" />
            <Button className="send-btn">Send</Button>
          </InputGroup>

          <p className="terms-text">
            By providing your phone number, you agree to receive a one-time automated text message
            with a link to get the app. Standard messaging rates may apply.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearningTools
