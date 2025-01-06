import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import emailjs from 'emailjs-com';

function NewsletterForm({ userEmails }) {
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send email using emailjs
      const templateParams = {
        to_name: 'Recipient Name', // Add dynamic recipient name
        from_name: 'Your Name', // Add dynamic sender name
        message: text, // Use the text entered by the user as the message
        to_email: userEmails.join(','), // Join user emails with commas
        subject: subject // Add the subject to the template params
      };

      await emailjs.send('service_3hhjl8f', 'template_zudlvhm', templateParams, 'cgUekzOugYJR8skiZ');
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'long', // Full month name (e.g., "May")
        day: 'numeric', // Day of the month (e.g., "20")
        year: 'numeric' // Four-digit year (e.g., "2024")
      });
      // Save newsletter to Firestore
      const newsletterCollection = collection(firestore, 'Newsletters');
      await addDoc(newsletterCollection, {
        subject: subject,
        date: currentDate,
        text: text
      });

      setSubject('');
      setText('');
      setDate(currentDate);

      alert('Newsletter sent and saved successfully!');
    } catch (error) {
      console.error('Error sending and saving newsletter:', error);
      alert('Failed to send and save newsletter. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="subject">Subject:</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="text">Body:</label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
      </div>
      <button type="submit">Post</button>
    </form>
  );
}

export default NewsletterForm;
