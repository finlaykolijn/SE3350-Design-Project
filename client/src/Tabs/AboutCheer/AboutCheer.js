import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faEye, faDonate, faCalendarAlt, faUserPlus, faMicrophone, faStar } from '@fortawesome/free-solid-svg-icons';
import './AboutCheer.css';
import sunsetCommunityFoundation from '../../resources/images/Sunset-Community-Foundation.png';
import rockGlen from '../../resources/images/rockGlen.png';
import ontarioCaregiverOrganization from '../../resources/images/OntarioCaregiverOrganization.png';
import algarva168 from '../../resources/images/Algarva-168.png';

function AboutCheer() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isSpeaking, setIsSpeaking] = useState(false);

  //for text to speech
  const readText = (text, elementId) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    if (!isSpeaking) {
      window.speechSynthesis.speak(speech);
    } else {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(!isSpeaking);
  };

  const images = [
    require("../../resources/images/Public Photo Gallery/Image1.jpeg"),
    require("../../resources/images/Public Photo Gallery/Photo-2022-07-27,-11-28-08-AM.jpeg"),
    require("../../resources/images/Public Photo Gallery/summer-camps.jpeg")
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // Change image every 10 seconds

    return () => clearInterval(intervalId);
  }, [images.length]);


  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  const partnerships = [
    { image: sunsetCommunityFoundation, label: "Sunset Community Foundation" }, //1024 x 453
    { image: rockGlen, label: "Rock Glen" }, // 400 x 400
    { image: ontarioCaregiverOrganization, label: "Ontario Caregiver Organization" }, //500 x 300
    { image: algarva168, label: "Algarva-168" } //225 x 225
  ];

  return (
    <div className="aboutcheer-container">
      <section id="gallery">
        <div className="header-container">
        </div>
        <div className="hero-banner">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              className={index === currentImageIndex ? 'fade-in-out' : 'fade-in-out hidden'}
            />
          ))}
          <div className="cta-button">
            <NavLink to="/Members" className="textbox-link">
              <a href="#" className="btn" style={{ textAlign: 'center' }}>View our Members Page</a>
            </NavLink>
          </div>

          <div className="dots-container">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      <section id="flex-container">
        <div className="flex-box">
          <div className="icon-container">
            <button className="microphone-button" onClick={() => readText("Donate. Help us by Donating. " + document.getElementById("readDonate").textContent)}>
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>
          <div className="content">
            <h3><FontAwesomeIcon icon={faDonate} size="2x" /> Donate</h3>
            <NavLink to="/grants" className="flexbox-link">Help us by donating</NavLink>
            <p id="readDonate">Explore the different ways you can support Ongoing Living & Learning Inc. You CAN make a difference!</p>
          </div>
        </div>
        <div className="flex-box">
          <div className="icon-container">
            <button className="microphone-button" onClick={() => readText("Events. View our newsletter. " + document.getElementById("readEvents").textContent)}>
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>
          <div className="content">
            <h3><FontAwesomeIcon icon={faCalendarAlt} size="2x" /> Events</h3>
            <NavLink to="/newsLetter" className="flexbox-link">View our newsletter</NavLink>
            <p id="readEvents">Get updates on all the amazing stuff we are up to!</p>
          </div>
        </div>
        <div className="flex-box">
          <div className="icon-container">
            <button className="microphone-button" onClick={() => readText("Apply. Become a registered CHEER member. " + document.getElementById("readApply").textContent)}>
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>
          <div className="content">
            <h3><FontAwesomeIcon icon={faUserPlus} size="2x" /> Apply</h3>
            <NavLink to="/register" className="flexbox-link">Become a registered CHEER member</NavLink>
            <p id="readApply">CHEER has many positions available to a variety of people in the area</p>
          </div>
        </div>
      </section>

      <section id="additional-flexboxes" className="flexboxes-container">
        <div className="flex-container">
          <div>
            <h3><FontAwesomeIcon icon={faQuestionCircle} size="2x" /> What is OLLI?
              <button id="additional-microphone" onClick={() => readText("What is OLLI? " + document.getElementById("readWhatIsOLLI").textContent)}>
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            </h3>
            <p id="readWhatIsOLLI">OLLI is a registered not-for-profit caregiver driven company with four areas of focus: Cheer Group; Cheer Works; Cheer Connections; and, Cheer Living.</p>
          </div>

          <div>
            <h3><FontAwesomeIcon icon={faEye} size="2x" /> Vision Statement

              <button id="additional-microphone" onClick={() => readText("Vision Statement. " + document.getElementById("readVisionStatement").textContent)}>
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            </h3>
            <p id="readVisionStatement">To be a community of inclusion and a circle of friendship that supports and enhances the lives of our loved ones with intellectual disabilities as well as the whole family.</p>

          </div>
        </div>
      </section>
      <section id="partnerships">
        <h2>Our Partnerships / Key Contributors</h2>
        <div className="partnerships-grid">
          {partnerships.map((partner, index) => (
            <div key={index} className="partner">
              <img src={partner.image} alt={partner.label} className="partner-image" />
              <p>{partner.label}</p>
            </div>
          ))}
        </div>
        <div className="reviews-tab">
        <button className="reviews-btn" onClick={() => window.location.href="/reviews"}>
          <FontAwesomeIcon icon={faStar} /> Check out our reviews!
        </button>
      </div>
      </section>

    </div>
  );
}

export default AboutCheer;
