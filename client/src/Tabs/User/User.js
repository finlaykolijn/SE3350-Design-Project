import React, {useEffect, useState} from 'react';
import './User.css';
import { useNavigate } from "react-router-dom";
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {firestore} from "../../config/firebase";
import {useAuth} from "../Context/AuthContext";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";

function User() {
    const { user } = useAuth();
    const navigate = useNavigate()
    const [events, setEvents] = useState([]);
    const [userData, setUserData] = useState([]);


    // Function to get user type based on UID
    async function getUserType(uid) {

        const docRef = doc(firestore, 'CHEER', uid);
        const docSnap = await getDoc(docRef);

        return docSnap.data().accountType;
    }

    const fetchID = async () => {
        try {
            const userType = await getUserType(user.auth.lastNotifiedUid)
            if (userType === 'User') {

            } else {
                navigate('/')
            }
        } catch (error) {
            console.error("No account: ", error);
            navigate('/')
        }
    }

    fetchID()

    const fetchUsers = async () => {
        if (user) {
            try {
                const userName = await user.email
                // Fetch users from the CHEER collection
                const usersSnapshot = await getDocs(collection(firestore, 'UserSignups'));
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(event => event.email === userName);

                setUserData(usersList);

            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to fetch user data.');
            }
        }

    };

    fetchUsers()


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsSnapshot = await getDocs(collection(firestore, 'Calendar'));
                const eventData = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(event => event.group === 'Client');
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
                    const updatedCurrentClients = matchingEvent.currentClients - 1;

                    // Update the Firestore document with the new current number of clients
                    await setDoc(doc(firestore, 'Calendar', matchingEvent.id), { currentClients: updatedCurrentClients }, { merge: true });

                alert('You successfully removed yourself from an event!');
                // Update the userData state to remove the user
                setUserData(userData.filter(user => user.id !== eventID));
                } else {
                    console.error('Matching event not found in the Calendar collection.');
                }
                // Update the userData state to remove the event
                setUserData(userData.filter(event => event.id !== eventID));
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
        \nCurrent Clients: ${info.event.extendedProps.currentClients}
        \nMax Clients: ${info.event.extendedProps.maxClients}
        \nDo you want to sign up for this event?`);

        if (isConfirmed) {
            if (info.event.extendedProps.currentClients === info.event.extendedProps.maxClients) {
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
                    currentClients: info.event.extendedProps.currentClients + 1
                };

                await setDoc(doc(firestore, 'Calendar', info.event.id), updatedEvent, { merge: true });
                alert(`You have signed up for ${info.event.extendedProps.name} between ${info.event.start} and ${info.event.end}`)
            }
        }
    };

    const eventContent = (eventInfo) => {
        return (
            <>
                <div  className="event-wrapper" style={{ backgroundColor: 'lightblue' }}>
                    {eventInfo.event.extendedProps.name}
                </div>
            </>
        );
    };

    const formatDate = (dateString) => {
        // Convert Firestore Timestamp to milliseconds
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
    };



    return (
        <div className="grants-container">
            <h1>User Page</h1>
            <p>
                Here is your personal page where you can see all events and a list of which ones you have signed up for. Below is a list
                of consent forms that must be filled out in order for an attendee to participate in an event. Please create
                a personal copy of all the forms, fill them out, and email them to <a href="mailto:ongoinglivinglearning@gmail.com" style={{color: 'blue', textDecoration: 'underline'}}>ongoinglivinglearning@gmail.com</a>.
            </p>
            <div>
                <a href='https://docs.google.com/document/d/1GbLAj8M7l4bvNb1Ljiis60jjp2myPwsi30-r5S9IxLU/edit?usp=drive_link' target="_blank">Photo / Video Consent Form</a>

            </div>
            <div>
                <a href='https://docs.google.com/document/d/1gL0ngKTv1L_JatlsQtNxpR8Km7WSkyxMvqJ4axz5ngY/edit?usp=sharing' target="_blank">Emergency Contact Form</a>

            </div>
            <div>
                <a href='https://docs.google.com/document/d/1YaYnbaQxPrdH0l1WNjBPEHsOrMVtw75J3lffd_Jt418/edit?usp=sharing' target="_blank">Participant Profile</a>
            </div>
            <div>
                <a href='https://drive.google.com/file/d/1tfAvM3N1_vVPeQNnJPSCZzcPpypDeoye/view?usp=drive_link' target="_blank">Rules & Guidelines</a>
            </div>
            <div>
                <a href='https://docs.google.com/document/d/1HK3m-dMIRXlUC_f0Mvy02WiULBoLTThw9saVUwg-tJY/edit?usp=drive_link' target="_blank">Code of Conduct</a>
            </div>


            <section>
                <h2>User Events Calendar</h2>
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
                {userData.length > 0 && (
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
                        {userData.map(event => (
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
    );
}

export default User;