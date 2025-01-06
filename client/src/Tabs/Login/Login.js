import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../Context/AuthContext';
import { auth } from '../../config/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPen, faMicrophone } from '@fortawesome/free-solid-svg-icons';

import './Login.css';

function Login() {
  const [email, setEmail] = useState(''); // Rename username to email
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);  // Set the user in the context
      navigate('/'); // Navigate to the main page
    } catch (error) {
      console.error('Error logging in:', error);
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email"><FontAwesomeIcon icon={faEnvelope} />  Please Enter Email Address:</label>
          <input
            type="email" // Change type to email for proper validation
            id="email"
            name="email"
            value={email}
            onChange={e => handleChange(e, setEmail)}
            required
          />
          <button onClick={() => readText("Email field")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </div>
        <div className="form-group">
          <label htmlFor="password">Please Enter Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={e => handleChange(e, setPassword)}
            required
          />
          <button onClick={() => readText("Password field")}><FontAwesomeIcon icon={faMicrophone} /></button>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
