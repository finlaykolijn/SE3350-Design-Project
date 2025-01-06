import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './Grants.css';
import sunsetCommunityFoundation from '../../resources/images/Sunset-Community-Foundation.png';
import rockGlen from '../../resources/images/rockGlen.png';
import ontarioCaregiverOrganization from '../../resources/images/OntarioCaregiverOrganization.png';
import algarva168 from '../../resources/images/Algarva-168.png';

function Grants() {
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Define the partnerships data here
  const partnerships = [
    { image: sunsetCommunityFoundation, label: 'Sunset Community Foundation' },
    { image: rockGlen, label: 'Rock Glen' },
    { image: ontarioCaregiverOrganization, label: 'Ontario Caregiver Organization' },
    { image: algarva168, label: 'Algarva-168' }
  ];
  

  return (
    <div className="grants-container">
      <h2>Grants</h2>
      <section id="donate">
        <div className="header-container">
          <h2>Support CHEER</h2>
          <button onClick={() => readText("Support CHEER................................................." + document.getElementById("readSupportCHEER").textContent)}>
            <FontAwesomeIcon icon={faMicrophone} />
          </button>
        </div>
        <p id="readSupportCHEER">
          Help us continue our mission by supporting CHEER through grants and donations. We rely on the generosity of individuals and organizations to make a positive impact in the lives of those with disabilities.
          To make a donation, you can e-transfer to <a href="mailto:donate@cheer.org">donate@cheer.org</a>. Your contribution will directly support our programs and initiatives.
        </p>
        <p>
          Your support enables us to empower individuals with disabilities, providing resources and opportunities for growth and connection. Join our mission—contribute through Canada Helps and help us bring positive change.
        </p>
        <a href="https://www.canadahelps.org/en/pages/olli-cheer/" target="_blank" rel="noopener noreferrer" className="donate-button">Support CHEER</a>
      </section>

      {/* Partnerships Section */}
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
      </section>
    </div>
  );
}

export default Grants;
