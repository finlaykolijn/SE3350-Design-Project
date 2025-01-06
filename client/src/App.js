//import React, {useState} from 'react';
import {BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {useAuth} from './Tabs/Context/AuthContext'; // Correct path to AuthContext
import {firestore} from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';


// Import all other components
import AboutUs from './Tabs/AboutCheer/AboutCheer';
import Members from './Tabs/Members/Members';
import NewsLetter from './Tabs/NewsLetter/NewsLetter';
import Grants from './Tabs/Grants/Grants';
import ContactUs from './Tabs/ContactUs/ContactUs';
import Login from './Tabs/Login/Login';
import Register from './Tabs/Register/Register';
import AdminLogin from './Tabs/Admin/AdminLogin';
import User from './Tabs/User/User';
import Staff from './Tabs/Staff/Staff';
import Reviews from './Tabs/Reviews/Reviews';

import './App.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEnvelope, faHandHoldingUsd, faHome, faNewspaper, faUser, faUsers} from '@fortawesome/free-solid-svg-icons';


function App() {
  // const { user, logout } = useContext(AuthContext);
  const { user, logout } = useAuth();

  // const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };
  

  const fetchAccount = async () => {
    try {
      const userType = await getUserType(user.auth.lastNotifiedUid)
      if (userType === 'User') {
        console.log('user')
        window.location.href = '/user-page'
        // navigate('/user-page');
      } else if (userType === 'Employee') {
        window.location.href = '/staff-page'
        // navigate('/staff-page');
      } else if (userType === 'Admin') {
        window.location.href = '/admin-login'
        // navigate('/admin-login');
      }
    } catch (error) {
      console.error("Failed navigate to account page:", error);
    }
  }

  // Function to get user type based on UID
  async function getUserType(uid) {

    const docRef = doc(firestore, 'CHEER', uid);
    const docSnap = await getDoc(docRef);

    return docSnap.data().accountType;
  }

  return (
    <BrowserRouter>
      <div>
        <header className="header">
          <div className="header-content">
            <img src={require("./resources/images/OLLI_LOGO-transparent.png")} alt="OLLI Logo" className="logo" />
            
            <h1>Ongoing Living & Learning Inc.</h1>
            {user ? (
                <div>
                  <div className="login">
                    <span>Welcome back, {user.email}!</span>
                    <button onClick={fetchAccount}>
                      <FontAwesomeIcon icon={faUser} /> Account Page
                    </button>
                    <button onClick={handleLogout}>
                      <FontAwesomeIcon icon={faUser} /> Log Out
                    </button>
                  </div>
                  {/* this clock in button not currently in use, located elsewhere. keeping this for now in case things change
              <div>
                <button id="clockInBtn" className="clock-in-btn">
                  <FontAwesomeIcon icon={faClock} />
                  <i class="clock"></i> Clock in/out
                </button>
              </div> */}
                </div>


              
            ) : (
              <div>
                <NavLink className="login" to="/login">
                  <FontAwesomeIcon icon={faUser} /> Log in
                </NavLink>
                <NavLink className="register" to="/register">
                  <FontAwesomeIcon icon={faUser} /> Register
                </NavLink>
                <NavLink className="admin-login" to="/admin-login">
                  <FontAwesomeIcon icon={faUser} /> Admin Login
                </NavLink>

              </div>
            )}
          </div>
        </header>

        <Navigation />

        <Routes>
          <Route path="/user-page" element={<User />} />
          <Route path="/staff-page" element={<Staff />} />
          <Route path="/members" element={<Members />} />
          <Route path="/newsLetter" element={<NewsLetter />} />
          <Route path="/grants" element={<Grants />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/reviews" element={<Reviews/>} />
          <Route path="/" element={<AboutUs />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function Navigation() {
  const location = useLocation();

  return (
    <nav>
      <ul>
        <li><NavLink exact to="/" className={location.pathname === "/" ? "active" : ""}><FontAwesomeIcon icon={faHome} /> ABOUT US</NavLink></li>
        <li><NavLink to="/members" className={location.pathname === "/members" ? "active" : ""}><FontAwesomeIcon icon={faUsers} /> MEMBERS</NavLink></li>
        <li><NavLink to="/newsLetter" className={location.pathname === "/newsLetter" ? "active" : ""}><FontAwesomeIcon icon={faNewspaper} /> NEWS LETTER</NavLink></li>
        <li><NavLink to="/grants" className={location.pathname === "/grants" ? "active" : ""}><FontAwesomeIcon icon={faHandHoldingUsd} /> GRANTS</NavLink></li>
        <li><NavLink to="/contactUs" className={location.pathname === "/contactUs" ? "active" : ""}><FontAwesomeIcon icon={faEnvelope} /> CONTACT US</NavLink></li>
      </ul>
    </nav>
  );
}

export default App;
