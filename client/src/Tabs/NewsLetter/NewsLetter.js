import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStar } from '@fortawesome/free-solid-svg-icons'; // Add faStar for review icon

import './NewsLetter.css';
import { addDoc, collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import AdminLogin from '../Admin/AdminLogin';

function NewsLetter(onSubscribe, isLoggedIn, isAdmin) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newsletters, setNewsletters] = useState([]);


  const handleChange = (event, setter) => {
    const { value } = event.target;
    setter(value);
  };

  const handleDeleteNewsletter = async (subject) => {
    try {
      const newslettersCollection = collection(firestore, 'Newsletters');
      const querySnapshot = await getDocs(newslettersCollection);
      querySnapshot.forEach(async (doc) => {
        const newsletter = doc.data();
        if (newsletter.subject === subject) {
          await deleteDoc(doc.ref);
          // Remove the deleted newsletter from the state
          setNewsletters(newsletters.filter(item => item.subject !== subject));
          alert('Newsletter deleted successfully!');
        }
      });
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      alert('Failed to delete newsletter. Please try again later.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const newsletterSubCollection = collection(firestore, 'NewsletterSub');
      const q = query(newsletterSubCollection, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setEmail('');
      alert('You have unsubscribed successfully!');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      alert('Failed to unsubscribe. Please try again later.');
    }
  };

  const readText = (text) => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Add subscriber's name and email to Firestore collection
      const newsletterSubCollection = collection(firestore, 'NewsletterSub');
      await addDoc(newsletterSubCollection, {
        name: name,
        email: email
      });
      // Reset the form fields
      setName('');
      setEmail('');
      alert('You have subscribed to the newsletter successfully!');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Failed to subscribe to newsletter. Please try again later.');
    }
  };

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const newslettersCollection = collection(firestore, 'Newsletters');
        const snapshot = await getDocs(newslettersCollection);
        const newsletterData = snapshot.docs.map(doc => doc.data());
        newsletterData.sort((a, b) => {
          // Check if either newsletter has a missing or empty date field
          if (!a.date || !b.date) {
            // Sort newsletters with missing or empty dates to the bottom
            if (!a.date && !b.date) {
              // If both dates are missing, maintain the current order
              return 0;
            } else if (!a.date) {
              // If only newsletter A has a missing date, move it to the bottom
              return 1;
            } else {
              // If only newsletter B has a missing date, move it to the bottom
              return -1;
            }
          }

          // If both newsletters have valid dates, sort by date in descending order
          return new Date(b.date) - new Date(a.date);
        });

        setNewsletters(newsletterData);
      } catch (error) {
        console.error('Error fetching newsletters:', error);
      }
    };

    fetchNewsletters();
  }, []);

  const NewsletterContainer = ({ subject, text, date }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
      setExpanded(!expanded);
    };

    return (

      <div className="newsletter-post" onClick={toggleExpanded}>
        <h3>{subject}</h3>
        <em>{date}</em> {/* Render the date in italics */}
        {isAdmin && ( // Render delete button only if isAdmin is true
          <button onClick={() => handleDeleteNewsletter(subject)}>Delete</button>
        )}
        {expanded && <p>{text}</p>}
      </div>
    );
  };


  return (

    <div className="newsletter-page">
      <h2 className="newsletter-title">Subscribe to Our Newsletter</h2>
      <form className="newsletter-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => handleChange(e, setName)}
            required
          />
          <button onClick={() => readText("Name field")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => handleChange(e, setEmail)}
            required
          />
          <button onClick={() => readText("Email field")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </div>
        <div className="form-group">
          <button type="submit" onClick={handleSubmit}>Subscribe</button>
          <button type="button" onClick={handleUnsubscribe}>Unsubscribe</button>
        </div>
      </form>

      <div className="newsletter-container">
        {/* Display newsletters */}
        {newsletters.map((newsletter, index) => (
          <NewsletterContainer key={index} subject={newsletter.subject} text={newsletter.text} date={newsletter.date} />
        ))}
      </div>
      <div className="reviews-tab">
        <button className="reviews-btn" onClick={() => window.location.href = "/reviews"}>
          <FontAwesomeIcon icon={faStar} /> Check out our reviews!
        </button>
      </div>
    </div>
  );
}

export default NewsLetter;
