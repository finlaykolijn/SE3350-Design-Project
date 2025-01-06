import React, { useEffect, useState } from 'react';
import './Staff.css';
import {useAuth} from "../Context/AuthContext";
import {useNavigate} from "react-router-dom";
import {collection, doc, getDoc, getDocs, addDoc, deleteDoc, setDoc} from "firebase/firestore";
import {auth, firestore} from "../../config/firebase";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

function Staff() {
  useEffect(() => {
    fetchUsers(); // Call fetchUsers immediately when the component mounts
  }, []); // Empty dependency array ensures this effect runs only once
  const { user } = useAuth();
  const navigate = useNavigate()
  const [events, setEvents] = useState([]);

  //for time sheet
  const [userEmails, setUserEmails] = useState([]);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [shouldSubmitForm, setShouldSubmitForm] = useState(false);
  const [userData, setUserData] = useState([]);
  const [userEvents, setUserEvents] = useState([]);


    // Function to get user type based on UID
    async function getUserType(uid) {

        const docRef = doc(firestore, 'CHEER', uid);
        const docSnap = await getDoc(docRef);

        return docSnap.data().accountType;
    }

    const fetchID = async () => {
        try {
            const userType = await getUserType(user.auth.lastNotifiedUid)
            if (userType === 'Employee') {

            } else {
                navigate('/')
            }
        } catch (error) {
            console.error("No account: ", error);
            navigate('/')
        }
    }

    fetchID()

    const fetchUserEvents = async () => {
        if (user) {
            try {
                const userName = await user.email
                // Fetch users from the CHEER collection
                const usersSnapshot = await getDocs(collection(firestore, 'UserSignups'));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(event => event.email === userName);

                setUserEvents(usersList);

            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to fetch user data.');
            }
        }

    };

    fetchUserEvents()


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsSnapshot = await getDocs(collection(firestore, 'Calendar'));
                const eventData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                setEvents(eventData);
            } catch (error) {
                alert(`Error fetching events: ${error}`);
            }
        };

        fetchEvents();
    }, []);


    //EDITING USER DATA
    const removeEvent = async (eventID, eventName, eventDescription) => {
        // Display a confirmation dialog
        const isConfirmed = window.confirm("Are you sure you want to remove this event from your signups?");

        // Proceed with deletion if the user confirms
        if (isConfirmed) {
            try {
                await deleteDoc(doc(firestore, 'UserSignups', eventID));

                // Find the corresponding event in the Calendar collection
                const calendarSnapshot = await getDocs(collection(firestore, 'Calendar'));
                const calendarEvents = calendarSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingEvent = calendarEvents.find(event => event.name === eventName && event.description === eventDescription);

                if (matchingEvent) {
                    // Decrement the current number of users in the event by 1
                    const updatedCurrentStaff = matchingEvent.currentStaff - 1;

                    // Update the Firestore document with the new current number of clients
                    await setDoc(doc(firestore, 'Calendar', matchingEvent.id), { currentStaff: updatedCurrentStaff }, { merge: true });

                    alert('You successfully removed yourself from an event!');
                    // Update the userData state to remove the user
                    setUserEvents(userData.filter(user => user.id !== eventID));
                } else {
                    console.error('Matching event not found in the Calendar collection.');
                }
                // Update the userData state to remove the event
                setUserEvents(userData.filter(event => event.id !== eventID));
            } catch (error) {
                console.error('Error removing event signup: ', error);
                alert('Failed to remove event signup.');
            }
        } else {
            // User did not confirm, do nothing
            console.log("Event removal cancelled.");
        }
    };



    const handleEventClick = async (info) => {
        const isConfirmed = window.confirm(
            `Event: ${info.event.extendedProps.name}
        \nStart: ${info.event.start}
        \nEnd: ${info.event.end}
        \nDescription: ${info.event.extendedProps.description}
        \nGroup: ${info.event.extendedProps.group}
        \nCurrent Staff: ${info.event.extendedProps.currentStaff}
        \nMax Staff: ${info.event.extendedProps.maxStaff}
        \nAre you planning to administer this event?`);

        if (isConfirmed) {
            if (info.event.extendedProps.currentStaff === info.event.extendedProps.maxStaff) {
                alert('The maximum number of clients are already in the event! Cannot join')
            } else {
                const userEvent = collection(firestore, 'UserSignups');
                await addDoc(userEvent, {
                    email: user.email,
                    event: info.event.extendedProps.name,
                    description: info.event.extendedProps.description,
                    start: info.event.start,
                    end: info.event.end
                });
                const updatedEvent = {
                    currentStaff: info.event.extendedProps.currentStaff + 1
                };

                await setDoc(doc(firestore, 'Calendar', info.event.id), updatedEvent, { merge: true });
                alert(`You have signed up to administer ${info.event.extendedProps.name} between ${info.event.start} and ${info.event.end}`)

            }
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


    const formatDate = (dateString) => {
        // Convert Firestore Timestamp to milliseconds
        try {
            const milliseconds = dateString.seconds * 1000 + dateString.nanoseconds / 1000000;

            // Create a Date object from milliseconds
            const date = new Date(milliseconds);

            // Adjust time zone to EST
            const estOffset = -5 * 60 * 60 * 1000; // Offset for EST in milliseconds
            const estDate = new Date(date.getTime() + estOffset);

            // Format the date as a string
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                timeZone: 'America/New_York' // Time zone set to EST
            };

            return estDate.toLocaleDateString('en-US', options);
        } catch (Error) {
            console.log('error')
        }

    };





    //TIME SHEET LOGIC
//from admin file
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
  const defaultRate = 20.00;

  const [rate, setRate] = useState(defaultRate);


// Function to calculate total
const calculateTotal = (hours) => {
  return (parseFloat(hours) * parseFloat(rate)).toFixed(2);
};

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

//this is breaking the page... sometimes?
//Check local storage for clock-in time when component mounts
// useEffect(() => {
//   const storedClockInTime = localStorage.getItem('clockInTime');
//   if (storedClockInTime) {
//     setClockInTime(storedClockInTime);
//   }
// }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//         await fetchUsers(); // Wait for user data to be fetched
//         // Proceed with operations that depend on userData
//         if (clockInTime && clockOutTime) {
//             addTimeSheetData();
//         }
//     };
//     fetchData();
//     }, [clockInTime, clockOutTime]);

//Handling the clock in button
const handleClockIn = () => {
  //Set current time as clock in time, convert to readable format
  fetchUsers();
  const currentDateTime = new Date().toISOString('en-US', { timeZone: 'America/Toronto' }).slice(0, 16)
  setClockInTime(currentDateTime);
  //Store clock in time in local storage
  localStorage.setItem('clockInTime', currentDateTime);
  alert('Clock in time recorded: ' + currentDateTime);
};

//Handling the clock out button
const handleClockOut = async () => {
  //Set current time as clock out time, convert to readable format 
  const currentDateTime = new Date().toISOString('en-US', { timeZone: 'America/Toronto' }).slice(0, 16)
  setClockOutTime(currentDateTime);
  //Clear clock in time from local storage
  localStorage.removeItem('clockInTime');
  alert('Clock out time recorded: ' + currentDateTime);
  // await addTimeSheetData(); //Adds to time sheet immediately after clocked out
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
      alert(currentUserData)
      alert(auth.currentUser.email)
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

    return (
      <div>
      <div className="grants-container">
          <h1>Staff Page</h1>
          <p>
              Here is your personal page where you can see all events and a list of staff events
          </p>
          <section>
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
        {/* these buttons bug out the server when something is in the local storage, so we decided to get rid of them for now
        <button onClick={handleClockIn}>Clock In</button>
        <button onClick={handleClockOut}>Clock Out</button> */}
    </div>
          </section>
          <section>
              <h2>Staff Events Calendar</h2>
              <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  eventContent={eventContent}
                  eventClick={handleEventClick}
              />
          </section>
          <section>
              <h2>Personal Events List</h2>
              {userEvents.length > 0 && (
                  <table>
                      <thead>
                      <tr>
                          <th>Event</th>
                          <th>Description</th>
                          <th>Start Time</th>
                          <th>End Time</th>
                          <th>Action</th>
                      </tr>
                      </thead>
                      <tbody>
                      {userEvents.map(event => (
                          <tr key={event.id}>
                              <td>{event.event}</td>
                              <td>{event.description}</td>
                              <td>{formatDate(event.start)}</td>
                              <td>{formatDate(event.end)}</td>
                              <td>
                                  <button onClick={() => removeEvent(event.id, event.event, event.description)}>Remove</button>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              )}
          </section>
      </div>

      
    </div>
  );


}

export default Staff;