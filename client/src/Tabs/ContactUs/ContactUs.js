import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPen, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './ContactUs.css';

function ContactUs() {
  const [email, setEmail] = useState('');
  const [emailContent, setEmailContent] = useState('');

  const handleChange = (event, setter) => {
    const { value } = event.target;
    setter(value);
  };

  const readText = (text) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  function sendEmail() {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }
  
    // Content validation
    if (emailContent.trim() === '') {
      alert('Please enter some content for the email.');
      return;
    }
  
    // Send data to the server
    fetch('/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, emailContent }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Email sent successfully!');
          // Clear email and email content fields
          setEmail('');
          setEmailContent('');
        } else {
          alert('Error sending email. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
      });
  }

  return (
    <div className="contactUs-container">
    <h2>Contact Us</h2>
    <p><strong>Phone Number:</strong> </p>
        <p><strong>Address:</strong> 8685 Rockglen Rd. Arkona ON, N0M 1B0</p>
        <p><strong>Email:</strong> ongoinglivinglearning@gmail.com</p>
    <div className="form-and-map-container">
      <div className="email-form">
        <h2>Email Form</h2>
        <form id="emailForm">
          <div className="form-group">
            <label htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} /> Email: 
              <button onClick={() => readText("Email field")}><FontAwesomeIcon icon={faMicrophone} /></button>
            </label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => handleChange(e, setEmail)} 
              placeholder="Enter email" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailContent">
              <FontAwesomeIcon icon={faPen} /> Enter Text: 
              <button onClick={() => readText("Email content field")}><FontAwesomeIcon icon={faMicrophone} /></button>
            </label>
            <textarea 
              id="emailContent" 
              rows="4" 
              cols="50" 
              value={emailContent} 
              onChange={(e) => handleChange(e, setEmailContent)} 
              placeholder="Enter text" 
              required
            ></textarea>
          </div>
          <button type="button" onClick={sendEmail}>Send Email</button>
        </form>
      </div>
        <div className="map-container">
          <div className="map">
          <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2913.8590700304725!2d-81.8208499!3d43.08409!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882f13a841b4229b%3A0x66f06e35c9ded4ab!2s8685+Rock+Glen+Rd%2C+Arkona%2C+ON+N0M+1B0%2C+Canada!5e0!3m2!1sen!2sus!4v1706805074781!5m2!1sen!2sus"
          width="100%"
          height="450"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
          </iframe>          
          </div>
        </div>
      </div>
      <div className='facebook'>
        <h2>
          Facebook Pages 
          <button onClick={() => readText("Facebook pages: Recreation and Leisure Program Page, Family Support Group Page, Assisted Employment Program Page")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </h2>
        <a className="facebook-link" href="https://www.facebook.com/cheer.2023?mibextid=ZbWKwL">
          <img src={require("../../resources/images/facebook-icon.png")} alt="Facebook Logo" width="20" height="20" />
          Recreation and Leisure Program Page
        </a>
        <a className="facebook-link" href="https://www.facebook.com/familyconnectionscheer?mibextid=ZbWKwL">
          <img src={require("../../resources/images/facebook-icon.png")} alt="Facebook Logo" width="20" height="20" />
          Family Support Group Page
        </a>
        <a className="facebook-link" href="https://www.facebook.com/profile.php?id=100057044577232&mibextid=ZbWKwL">
          <img src={require("../../resources/images/facebook-icon.png")} alt="Facebook Logo" width="20" height="20" />
          Assisted Employment Program Page
        </a>
      </div>
    </div>
  );
}

export default ContactUs;
