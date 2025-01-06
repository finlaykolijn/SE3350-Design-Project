import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import {getDocs, addDoc, collection, setDoc} from "firebase/firestore";
import { auth, firestore } from '../../config/firebase';
import NewsletterForm from './NewsletterForm';
import './AdminLogin.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { doc, deleteDoc } from 'firebase/firestore';
import {BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Reviews from '../Reviews/Reviews';
import NewsLetter from '../NewsLetter/NewsLetter';

import { formatDate } from 'fullcalendar';
import App from '../../App';

function AdminLogin() {
  const [email, setEmail] = useState('ongoinglivinglearning@gmail.com');
  const [password, setPassword] = useState('se3350');
  const [userData, setUserData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [events, setEvents] = useState([]);
  const [creatingNewsletter, setCreatingNewsletter] = useState(false);
  const [userEmails, setUserEmails] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [staffQuantity, setStaffQuantity] = useState(0);
  const [clientQuantity, setClientQuantity] = useState(0);
  

  const handleEvent = async (e) => {
    e.preventDefault();
    try {
      const eventCalendar = collection(firestore, 'Calendar');
      if (selectedOption === 'Staff') {
        await addDoc(eventCalendar, {
          name: title,
          description: description,
          start: startTime,
          end: endTime,
          allDay: allDay,
          group: selectedOption,
          currentStaff: 0,
          maxStaff: staffQuantity
        });
      } else if (selectedOption === 'Client') {
        await addDoc(eventCalendar, {
          name: title,
          description: description,
          start: startTime,
          end: endTime,
          allDay: allDay,
          group: selectedOption,
          currentStaff: 0,
          maxStaff: staffQuantity,
          currentClients: 0,
          maxClients: clientQuantity
        });
      }

      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setAllDay(false);
      setSelectedOption('Staff')

      alert('Event added successfully!');
    } catch (error) {
      alert(`Error adding event: ${error}`);
    }
  };

  // useEffect(() => {
  //   fetchUsers();
  // }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users from the CHEER collection
      const usersSnapshot = await getDocs(collection(firestore, 'CHEER'));
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Fetch emails from the NewsletterSub collection
      const newsletterSubSnapshot = await getDocs(collection(firestore, 'NewsletterSub'));
      const newsletterSubList = newsletterSubSnapshot.docs.map(doc => doc.data().email);
  
      // Merge user emails with newsletter emails
      const allEmails = [...new Set([...usersList.map(user => user.email), ...newsletterSubList])];
  
      setUserData(usersList);
      setUserEmails(allEmails); // Update userEmails with merged emails
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to fetch user data.'); 
    }
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setIsLoggedIn(true);
    
    // Check if the logged-in user is the admin
    if (userCredential.user.email === 'ongoinglivinglearning@gmail.com') {
      setIsAdmin(true);
      console.log('Admin signed in:', userCredential.user);
    }
  } catch (error) {
    console.error('Error signing in admin', error);
    alert(error.message);
  }
  };
  console.log('Admin log:', isAdmin);
  useEffect(() => {
    console.log('isAdmin:', isAdmin);
  }, [isAdmin]);

  const handleCreateNewsletter = () => {
    setCreatingNewsletter(true);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(firestore, 'Calendar'));
        const eventData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventData);
      } catch (error) {
        alert(`Error fetching events: ${error}`);
      }
    };

    fetchEvents();
    fetchUsers();
  }, []);

  const handleEventClick = (info) => {
    let isConfirmed;

    if (info.event.extendedProps.group === 'Client') {
      isConfirmed = window.confirm(
          `Event: ${info.event.extendedProps.name}
        \nStart: ${info.event.start}
        \nEnd: ${info.event.end}
        \nDescription: ${info.event.extendedProps.description}
        \nGroup: ${info.event.extendedProps.group}
        \nCurrent Staff: ${info.event.extendedProps.currentStaff}
        \nMax Staff: ${info.event.extendedProps.maxStaff}
        \nCurrent Clients: ${info.event.extendedProps.currentClients}
        \nMax Clients: ${info.event.extendedProps.maxClients}
        \nDo you want to edit or delete this event?`);
    } else if (info.event.extendedProps.group === 'Staff') {
      isConfirmed = window.confirm(
          `Event: ${info.event.extendedProps.name}
        \nStart: ${info.event.start}
        \nEnd: ${info.event.end}
        \nDescription: ${info.event.extendedProps.description}
        \nGroup: ${info.event.extendedProps.group}
        \nCurrent Staff: ${info.event.extendedProps.currentStaff}
        \nMax Staff: ${info.event.extendedProps.maxStaff}
        \nDo you want to edit or delete this event?`);
    }

    if (isConfirmed) {
      // Edit or delete event
      const action = prompt("Do you want to edit or delete this event? (edit/delete)");
      if (action === "edit") {
        const event = info.event;
        setTitle(event.extendedProps.name);
        setDescription(event.extendedProps.description);
        setStartTime(event.start.toISOString().slice(0, 16)); // Format: YYYY-MM-DDTHH:MM
        setEndTime(event.end.toISOString().slice(0, 16)); // Format: YYYY-MM-DDTHH:MM
        setAllDay(event.allDay);
        setSelectedOption(event.extendedProps.group);
        setEditingEvent(event);
      } else if (action === "delete") {
        // Implement deletion logic
        handleDeleteEvent(info.event);
      } else {
        alert("Invalid action.");
      }
    }

  };

  const handleEditEvent = async (e) => {
    e.preventDefault();

    // Retrieve form data
    const updatedEvent = {
      name: title,
      description: description,
      start: startTime,
      end: endTime,
      allDay: allDay,
      group: selectedOption
    };

    try {
      // Update event in Firestore
      await setDoc(doc(firestore, 'Calendar', editingEvent.id), updatedEvent, { merge: true });
      alert('Event updated successfully!');
      setEditingEvent(null); // Reset editing event
    } catch (error) {
      alert(`Error updating event: ${error}`);
    }

  };

  const handleDeleteEvent = async (event) => {
    // Handle deleting event
    const eventId = event.id;
    try {
      // Delete event from Firestore
      await deleteDoc(doc(firestore, 'Calendar', eventId));
      alert('Event deleted successfully!');
      // Remove the event from the calendar
      event.remove();
    } catch (error) {
      alert(`Error deleting event: ${error}`);
    }
  };

  const eventContent = (eventInfo) => {
    return (
        <>
          <div  className="event-wrapper" style={{ backgroundColor: 'lightblue' }}>
            {eventInfo.event.extendedProps.name}
          </div>
          {/*<div>{eventInfo.event.extendedProps.start}</div>*/}
        </>
    );
  };


  //TIME SHEET LOGIC

  //Time sheet constants
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [shouldSubmitForm, setShouldSubmitForm] = useState(false);

  const defaultRate = 20.00;

  const [rate, setRate] = useState();
  
  
  // Function to calculate total
  const calculateTotal = (hours) => {
    return (parseFloat(hours) * parseFloat(rate)).toFixed(2);
  };
  
  const calculateTotal2 = (totalHours, rate) => {
    return (parseFloat(totalHours) * parseFloat(rate)).toFixed(2);
    
  };


  //EDITING TIME SHEET DATA
  useEffect(() => {
    const fetchTimeSheetData = async () => {
      try {
        const timeSheetCollection = collection(firestore, 'TimeSheet');
        const timeSheetSnapshot = await getDocs(timeSheetCollection);
        const timeSheetData = timeSheetSnapshot.docs.map(doc => ({
          id: doc.id, // Store the document ID as the entry ID
          ...doc.data() // Include document data
        }));
        setTimeSheetData(timeSheetData);
      } catch (error) {
        alert(`Error fetching time sheet data: ${error}`);
      }
    };
  
    fetchTimeSheetData();
  }, []);


  const removeTimeEntry = async (entryId) => {
    // Display a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to remove this entry?");
    
    // Proceed with deletion if the admin confirms
    if (isConfirmed) {
      try {
        await deleteDoc(doc(firestore, 'TimeSheet', entryId));
        alert('Entry removed successfully');
        // Update the userData state to remove the user
        setTimeSheetData(timeSheetData.filter(entry => entry.id !== entryId));
      } catch (error) {
        console.error('Error removing time sheet entry: ', error);
        alert('Failed to remove time sheet entry.');
      }
    } else {
      // Admin did not confirm, do nothing
      console.log("Entry removal cancelled.");
    }
  };

const [editingEntryId, setEditingEntryId] = useState(null);
const [editTimeSheetData, setEditTimeSheetData] = useState({
  firstName: "",
  lastName: "",
  username: "",
  clockInTime: "",
  clockOutTime: "",
  totalHours: "",
  rate: "",
  total: "",
});

const handleTimeSheetEditClick = (entry) => {
  // setEditingTimeSheet(entry.id);
  setEditingEntryId(entry.id);
  setEditTimeSheetData({
    firstName: entry.firstName,
    lastName: entry.lastName,
    username: entry.username,
    clockInTime: entry.clockInTime,
    clockOutTime: entry.clockOutTime,
    totalHours: entry.totalHours,
    rate: entry.rate,
    total: entry.total
  });
};

const handleTimeSheetEditFormChange = (event) => {
  const fieldName = event.target.name;
  const fieldValue = event.target.value;
  
  if (fieldName === 'rate' || fieldName === 'totalHours') {
    // If the rate or total hours change, update the total
    const updatedTotal = calculateTotal2(editTimeSheetData.totalHours, fieldValue);
    setEditTimeSheetData({ ...editTimeSheetData, [fieldName]: fieldValue, total: updatedTotal });
  } else {
    // For other fields, just update the form data
    setEditTimeSheetData({ ...editTimeSheetData, [fieldName]: fieldValue });
  }
};


const handleTimeSheetSaveClick = async () => {
  const entryRef = doc(firestore, "TimeSheet", editingEntryId);
  try {
    await setDoc(entryRef, editTimeSheetData, { merge: true });
    alert("User updated successfully");

    // Update local userData state with the edited user's new data
    const updatedData = timeSheetData.map((entry) => {
      if (entry.id === editingEntryId) {
        return { ...entry, ...editTimeSheetData };
      } else {
        return entry;
      }
    });

    setTimeSheetData(updatedData);
    // setEditingTimeSheet(null); // Exit editing mode
    setEditingEntryId(null);
  } catch (error) {
    console.error("Error updating user: ", error);
    alert("Failed to update user.");
  }
};
// ^Editing Time Sheet data



  // useEffect(() => {
  //   if (clockInTime && clockOutTime) {
  //     addTimeSheetData();
  //   }
  // }, [clockInTime, clockOutTime]);


  //Handles the calendar clocking in function
  const handleTimeSheetSubmit = async (e) => {
    e.preventDefault();
    setShouldSubmitForm(true); // Set shouldSubmitForm to true
  };

  //useEffect to listen for changes in shouldSubmitForm
  useEffect(() => {
    if (shouldSubmitForm) {
      addTimeSheetData(); //If shouldSubmitForm is true, submit the form
      setShouldSubmitForm(false); //Reset shouldSubmitForm after submission
    }
  }, [shouldSubmitForm]);

 //Check local storage for clock-in time when component mounts
  useEffect(() => {
    const storedClockInTime = localStorage.getItem('clockInTime');
    if (storedClockInTime) {
      setClockInTime(storedClockInTime);
    }
  }, []);

  //Handling the clock in button
  const handleClockIn = () => {
    //Set current time as clock in time, convert to readable format
    const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }).slice(0, 16)
    setClockInTime(currentDateTime);
    //Store clock in time in local storage
    localStorage.setItem('clockInTime', currentDateTime);
    alert('Clock in time recorded: ' + currentDateTime);
  };

  //Handling the clock out button
  const handleClockOut = () => {
    //Set current time as clock out time, convert to readable format 
    const currentDateTime = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' }).slice(0, 16)
    setClockOutTime(currentDateTime);
    //Clear clock in time from local storage
    localStorage.removeItem('clockInTime');
    alert('Clock out time recorded: ' + currentDateTime);
    addTimeSheetData(); //Adds to time sheet immediately after clocked out
  };


  //Handling adding data to the time sheet
  const addTimeSheetData = async () => {
    try {

      // Calculate total hours
      const totalHours = calculateTotalHours(clockInTime, clockOutTime);

      // Calculate total amount based on default rate
      const total = calculateTotal(totalHours);

      //Fetch user data if not already fetched
      if (userData.length === 0) {
        await fetchUsers();
      }
      // Find the current user's data from userData
      const currentUserData = userData.find(user => user.email === auth.currentUser.email);
      if (!currentUserData) {
        throw new Error('Current user data is not available.');
      }
      const { candidateFirstName, candidateLastName, username } = currentUserData;

      //Check if clockInTime is defined
      if (!clockInTime) {
        throw new Error('Clock in time is missing.');
      }
      
      //Adding data to firestore
      const timeSheetCollection = collection(firestore, 'TimeSheet');
      await addDoc(timeSheetCollection, {
        firstName: candidateFirstName,
        lastName: candidateLastName,
        username: username,
        clockInTime: clockInTime,
        clockOutTime: clockOutTime,
        totalHours: totalHours,
        rate: defaultRate,
        total: total
      });

      //Reset state after successful addition
      setClockInTime('');
      setClockOutTime('');

      //Fetch and display updated time sheet data
      await displayTimeSheetData();
      alert('Time sheet data added successfully!');
    } catch (error) {
      alert(`Error adding time sheet data: ${error.message}`);
    }
  };
  
  //Function to calculate total hours from clock in/out times
  const calculateTotalHours = (clockIn, clockOut) => {
    const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    const diffHours = diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
    return diffHours.toFixed(2); // Adjust as needed
  };

  //Function to display time sheet data
  const displayTimeSheetData = async () => {
    try {
      const timeSheetCollection = collection(firestore, 'TimeSheet');
      const timeSheetSnapshot = await getDocs(timeSheetCollection);
      const timeSheetData = timeSheetSnapshot.docs.map(doc => doc.data());
      setTimeSheetData(timeSheetData)
      //Set state or manipulate the data as needed
    } catch (error) {
      alert(`Error fetching time sheet data: ${error}`);
    }
  };

  
  // useEffect(() => {
  //   calculateTotal();
  // }, [editTimeSheetData.totalHours, editTimeSheetData.rate]);

  // Update displayTimeSheetData function to correctly display rate and total
// const displayTimeSheetData = async () => {
//   try {
//     const timeSheetCollection = collection(firestore, 'TimeSheet');
//     const timeSheetSnapshot = await getDocs(timeSheetCollection);
//     const timeSheetData = timeSheetSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       // Include rate and total in each entry
//       rate: doc.data().rate,
//       total: doc.data().total
//     }));
//     setTimeSheetData(timeSheetData);
//   } catch (error) {
//     alert(`Error fetching time sheet data: ${error}`);
//   }
// };


 
 





  

  //EDITING USER DATA
  const removeUser = async (userId) => {
    // Display a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to remove this user?");
    
    // Proceed with deletion if the admin confirms
    if (isConfirmed) {
      try {
        await deleteDoc(doc(firestore, 'CHEER', userId));
        alert('User removed successfully');
        // Update the userData state to remove the user
        setUserData(userData.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error removing user: ', error);
        alert('Failed to remove user.');
      }
    } else {
      // Admin did not confirm, do nothing
      console.log("User removal cancelled.");
    }
  };

  const [editingUserId, setEditingUserId] = useState(null);
const [editFormData, setEditFormData] = useState({
  candidateFirstName: "",
  candidateLastName: "",
  email: "",
  dob: "",
  guardian1Name: "",
  guardian1LastName: "",
  guardian2Name: "",
  guardian2LastName: "",
  guardianEmail: "",
  username: "",
  accountType: "",
  NewsOptIn: false, // Assuming this is a boolean field
});

const handleEditClick = (user) => {
  setEditingUserId(user.id);
  setEditFormData({
    candidateFirstName: user.candidateFirstName,
    candidateLastName: user.candidateLastName,
    email: user.email,
    dob: user.dob,
    guardian1Name: user.guardian1Name,
    guardian1LastName: user.guardian1LastName,
    guardian2Name: user.guardian2Name,
    guardian2LastName: user.guardian2LastName,
    guardianEmail: user.guardianEmail,
    username: user.username,
    accountType: user.accountType,
    NewsOptIn: user.NewsOptIn, // Assuming this is a boolean field
  });
};

const handleEditFormChange = (event) => {
  const fieldName = event.target.name;
  const fieldValue = event.target.value;
  setEditFormData({ ...editFormData, [fieldName]: fieldValue });
};

const handleSaveClick = async () => {
  const userRef = doc(firestore, "CHEER", editingUserId);
  try {
    await setDoc(userRef, editFormData, { merge: true });
    alert("User updated successfully");

    // Update local userData state with the edited user's new data
    const updatedUsers = userData.map((user) => {
      if (user.id === editingUserId) {
        return { ...user, ...editFormData };
      } else {
        return user;
      }
    });

    setUserData(updatedUsers);
    setEditingUserId(null); // Exit editing mode
  } catch (error) {
    console.error("Error updating user: ", error);
    alert("Failed to update user.");
  }
};
// ^Editing User Data


 

  //return statement for the whole admin-login page
  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>
      {!isLoggedIn ? (
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit">Login</button>
        </form>
      ) : (
        <>         
          <div className="add-event-form">
            <h2>Add Event</h2>
            <form onSubmit={handleEvent}>
              <label>
                Title:
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </label>
              <label>
                Description:
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
              </label>
              <label>
                Start Time:
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required={!allDay} />
              </label>
              <label>
                End Time:
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required={!allDay} />
              </label>
              <label>
                All Day:
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              </label>
              <h2>Choose which Group this is for</h2>
              <label>
                <input
                    type="radio"
                    value="Staff"
                    checked={selectedOption === "Staff"}
                    onChange={() => setSelectedOption("Staff")}
                />
                Staff ONLY Event
              </label>
              <label>
                <input
                    type="radio"
                    value="Client"
                    checked={selectedOption === "Client"}
                    onChange={() => setSelectedOption("Client")}
                />
                Client Event
              </label>
              <h3>Maximum Participants</h3>
              <label>
                Max staff members:
                <input
                    type="number" value={staffQuantity}
                    onChange={(e) => setStaffQuantity(e.target.value)}
                    min="0" max="100" required
                />
              </label>
              {selectedOption === "Client" && (
                  <label>
                    Max number of Clients:
                    <input
                        type="number" value={clientQuantity}
                        onChange={(e) => setClientQuantity(e.target.value)}
                        min="0" max="100" required
                    />
                  </label>
              )}

              <button type="submit">Add Event</button>
            </form>
          </div>

          

          <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventContent={eventContent}
              eventClick={handleEventClick}
          />

          {editingEvent && (
              <div className="edit-event-form">
                <h2>Edit Event: {editingEvent.extendedProps.name}</h2>
                <form onSubmit={handleEditEvent}>
                  <label>
                    Title:
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </label>
                  <label>
                    Description:
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                  </label>
                  <label>
                    Start Time:
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required={!allDay} />
                  </label>
                  <label>
                    End Time:
                    <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required={!allDay} />
                  </label>
                  <label>
                    All Day:
                    <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                  </label>
                  <h2>Choose which Group this is for</h2>
                  <label>
                    <input
                        type="radio"
                        value="Staff"
                        checked={selectedOption === "Staff"}
                        onChange={() => setSelectedOption("Staff")}
                    />
                    Staff Event
                  </label>
                  <label>
                    <input
                        type="radio"
                        value="Client"
                        checked={selectedOption === "Client"}
                        onChange={() => setSelectedOption("Client")}
                    />
                    Client Event
                  </label>
                  <button type="submit">Update Event</button>
                </form>
              </div>
          )}
          <div> </div>




          <button onClick={fetchUsers}>Fetch User Data</button>
          <button onClick={handleCreateNewsletter}>Create Newsletter</button>
          {userData.length > 0 && (
            <div>
              <h3>User Data:</h3>
              <table>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Date of Birth</th>
                    <th>Guardian 1 Name</th>
                    <th>Guardian 1 Last Name</th>
                    <th>Guardian 2 Name</th>
                    <th>Guardian 2 Last Name</th>
                    <th>Guardian Email</th>
                    <th>Username</th>
                    <th>Account Type</th>
                  </tr>
                </thead>
                <tbody>
  {userData.map((user) => (
    //Allows Admin To Edit Users
    <tr key={user.id}> 
      {editingUserId === user.id ? (
        <>
          <td>
            <input
              type="text"
              required
              name="candidateFirstName"
              value={editFormData.candidateFirstName}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              required
              name="candidateLastName"
              value={editFormData.candidateLastName}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="email"
              required
              name="email"
              value={editFormData.email}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="date"
              name="dob"
              value={editFormData.dob}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="guardian1Name"
              value={editFormData.guardian1Name}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="guardian1LastName"
              value={editFormData.guardian1LastName}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="guardian2Name"
              value={editFormData.guardian2Name}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="guardian2LastName"
              value={editFormData.guardian2LastName}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="email"
              name="guardianEmail"
              value={editFormData.guardianEmail}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <input
              type="text"
              name="username"
              value={editFormData.username}
              onChange={handleEditFormChange}
            />
          </td>
          <td>
            <select
              name="accountType"
              value={editFormData.accountType}
              onChange={handleEditFormChange}
            >
              <option value="Admin">Admin</option>
              <option value="Employee">Employee</option>
              <option value="User">User</option>
              
              {/* Add more options as needed */}
            </select>
          </td>
          <td>
            <input
              type="checkbox"
              name="NewsOptIn"
              checked={editFormData.NewsOptIn}
              onChange={(e) => setEditFormData({ ...editFormData, NewsOptIn: e.target.checked })}
            />
          </td>
          <td>
            <button type="button" onClick={handleSaveClick}>Save</button>
          </td>
        </>
      ) : (
        <>
          <td>{user.candidateFirstName}</td>
          <td>{user.candidateLastName}</td>
          <td>{user.email}</td>
          <td>{user.dob}</td>
          <td>{user.guardian1Name}</td>
          <td>{user.guardian1LastName}</td>
          <td>{user.guardian2Name}</td>
          <td>{user.guardian2LastName}</td>
          <td>{user.guardianEmail}</td>
          <td>{user.username}</td>
          <td>{user.accountType}</td>
          <td>
            <button type="button" onClick={() => handleEditClick(user)}>Edit</button>
          </td>
        </>
      )}
      <td>
        <button onClick={() => removeUser(user.id)}>Remove</button>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}
          {creatingNewsletter && <NewsletterForm userEmails={userEmails} />} {/* Pass userEmails as props */}

          {/*Time sheet form*/}
          <div className="time-sheet-form">
        <h2>Add Time Sheet Data</h2>
        <form>
          <label>
            Clock In Time:
            <input type="datetime-local" value={clockInTime} onChange={e => setClockInTime(e.target.value)} required />
          </label>
          <label>
            Clock Out Time:
            <input type="datetime-local" value={clockOutTime} onChange={e => setClockOutTime(e.target.value)} required />
          </label>
          <button type="submit" onClick={handleTimeSheetSubmit}>Submit</button>
        </form>
          {/* <button onClick={handleClockIn}>Clock In</button>
          <button onClick={handleClockOut}>Clock Out</button> */}
      </div>

      {/* Button to display time sheet data */}
      <button onClick={displayTimeSheetData}>Display Time Sheet Data</button>
      
       {/* Display time sheet data in a table */}
       {timeSheetData.length > 0 && (
        <div>
          <h3>Time Sheet Data:</h3>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
                <th>Total Hours</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
            {timeSheetData.map((entry) => (
                <tr key={entry.id}>
                  {editingEntryId === entry.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        required
                        name="firstName"
                        value={editTimeSheetData.firstName}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="lastName"
                        value={editTimeSheetData.lastName}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="username"
                        value={editTimeSheetData.username}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="clockInTime"
                        value={editTimeSheetData.clockInTime}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="clockOutTime"
                        value={editTimeSheetData.clockOutTime}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="totalHours"
                        value={editTimeSheetData.totalHours}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="rate"
                        value={editTimeSheetData.rate}
                        onChange={handleTimeSheetEditFormChange}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        required
                        name="total"
                        value={editTimeSheetData.total}
                        onChange={(e) => setEditTimeSheetData({ ...editTimeSheetData, total: e.target.value })}
                      />
                    </td>
                    <td>
                      <button type="button" onClick={handleTimeSheetSaveClick}>Save</button>
                    </td>
                    </>
                      ) : (
                    <>
                  <td>{entry.firstName}</td>
                  <td>{entry.lastName}</td>
                  <td>{entry.username}</td>
                  <td>{entry.clockInTime}</td>
                  <td>{entry.clockOutTime}</td>
                  <td>{entry.totalHours}</td>
                  <td>{entry.rate}</td>
                  <td>{entry.total}</td>
                  <td>
                  <button type="button" onClick={() => handleTimeSheetEditClick(entry)}>Edit</button>
                  </td>
                  </>
                  )}
                  <td>
                    <button onClick={() => removeTimeEntry(entry.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
        
      )}
      
    </div>
    
  );
}

export default AdminLogin;


//        {/* Display time sheet data in a table */}
//        {timeSheetData.length > 0 && (
//         <div>
//           <h3>Time Sheet Data:</h3>
//           <table>
//             <thead>
//               <tr>
//                 <th>First Name</th>
//                 <th>Last Name</th>
//                 <th>Username</th>
//                 <th>Clock In Time</th>
//                 <th>Clock Out Time</th>
//                 <th>Total Hours</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
// {timeSheetData.map((entry) => (
//                 <tr key={entry.id}>
//                   {editingTimeSheetId === entry.id ? (
//                     <>
//                       <td>
//                         <input
//                           type="text"
//                           value={editTimeSheetData.firstName}
//                           onChange={(e) => setEditTimeSheetData({ ...editTimeSheetData, firstName: e.target.value })}
//                         />
//                       </td>
//                       {/* Add other input fields for editing */}
//                       <td>
//                         <button onClick={handleSaveTimeSheet}>Save</button>
//                       </td>
//                     </>
//                   ) : (
//                     <>
//                       <td>{entry.firstName}</td>
//                       {/* Display other fields */}
//                       <td>
//                         <button onClick={() => handleEditTimeSheet(entry)}>Edit</button>
//                         <button onClick={() => handleRemoveTimeSheet(entry.id)}>Remove</button>
//                       </td>
//                     </>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//         </>
        
//       )}

      
//     </div>
    
//   );
// }

// export default AdminLogin;
