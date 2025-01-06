import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import './Members.css';

function Members() {

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

  return (
    <div className="members-container">
        <h2>Members</h2>

        <section id="about-members">
          <div className="header-container">
            <h2>About Our Members</h2>
            <button onClick={() => readText("About Our Members................................................." + document.getElementById("readAboutOurMembers").textContent)}>
            <FontAwesomeIcon icon={faMicrophone} /> </button>
          </div>
          <p id="readAboutOurMembers">Our members make us who we are. If you are the parent of an adult with
            disabilities and are looking for an opportunity to enroll them in engaging and fun activities,
            we would love to have them!</p>
        </section>

        <section id="join-us">
        <div className="header-container">
            <h2>Join Us!</h2>
            <button onClick={() => readText("Join Us!................................................." + document.getElementById("readJoinUs").textContent)}>
            <FontAwesomeIcon icon={faMicrophone} /> </button>
          </div>
          <p id="readJoinUs">The below link will take you to a sign up page so you can enter your contact
            details and we can learn more about your child and better match them to one of our
            various programs!</p>
            <NavLink to="/register" className="textbox-link"> Join Us!</NavLink>
        </section>

        <section id="sample-calendar">
        <div className="header-container">
            <h2>Sample Calendar</h2>
            <button onClick={() => readText("Sample Calendar................................................." + document.getElementById("readSampleCalendar").textContent)}>
            <FontAwesomeIcon icon={faMicrophone} /> </button>
          </div>
          <p id="readSampleCalendar">Below is an example of the possible activities and schedule your child could have
            when enrolled with CHEER! We offer programs of various intensities and can accommodate
            virtually any request to better align our programs with your child</p>
            <img src={require("../../resources/images/Sample-Calendar.jpeg")} alt="Sample Calendar Image" />
        </section>
    </div>
  );
}

export default Members;
