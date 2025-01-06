
import React, { useState } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import './Register.css';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdo1QZcZY8beIfRDSC7ftx5Pqti08ofdI",
  authDomain: "se3350-project-group38.firebaseapp.com",
  projectId: "se3350-project-group38",
  storageBucket: "se3350-project-group38.appspot.com",
  messagingSenderId: "165688153390",
  appId: "1:165688153390:web:2375fba1510c33412416bf"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const firestore = getFirestore();

function Register() {
  const [formData, setFormData] = useState({
    candidateFirstName: '',
    candidateLastName: '',
    email: '',
    dob: '',
    guardian1Name: '',
    guardian1LastName: '',
    guardian2Name: '',
    guardian2LastName: '',
    guardianEmail: '',
    username: '',
    password: '',
    accountType: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
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
    const auth = getAuth();
    const { email, password, ...rest } = formData;
  
    try {
      // Use Firebase Auth to create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
  
      // Store additional user data in Firestore under 'CHEER' collection
      await setDoc(doc(firestore, 'CHEER', user.uid), {
        ...rest,
        email, // include the email if you need it in your Firestore document
        NewsOptIn: false // Add NewsOptIn field with default value
      });
  
      alert('Account created successfully! Please check your email to verify your account.');
    } catch (error) {
      console.error('Error creating account', error);
      alert(error.message);
    }
  };
  

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Each input field structure */}
        {Object.keys(formData).map((key) => {
          if (key === 'dob') { // Date input
            return (
              <div className="form-group" key={key}>
                <label htmlFor={key}>{key.split(/(?=[A-Z])/).join(" ")}:</label>
                <input 
                  type="date" 
                  id={key} 
                  name={key}
                  value={formData[key]} 
                  onChange={handleChange} 
                  required 
                />
                <button onClick={() => readText(`${key.split(/(?=[A-Z])/).join(" ")}`)}><FontAwesomeIcon icon={faMicrophone} /></button>
              </div>
            );
          } else if (key !== 'password') { // Exclude password for custom handling
            return (
              <div className="form-group" key={key}>
                <label htmlFor={key}>{key.split(/(?=[A-Z])/).join(" ")}:</label>
                <input 
                  type={key === 'email' ? 'email' : 'text'} // Email input type for email
                  id={key} 
                  name={key}
                  value={formData[key]} 
                  onChange={handleChange} 
                  required={key.includes('guardian2') ? false : true} // Optional fields for guardian2
                />
                <button onClick={() => readText(`${key.split(/(?=[A-Z])/).join(" ")}`)}><FontAwesomeIcon icon={faMicrophone} /></button>
              </div>
            );
          }
          return null; // Placeholder for password handling
        })}
        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
          <button onClick={() => readText("Password field")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
