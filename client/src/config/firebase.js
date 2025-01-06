// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "", //Deleted for security reasons
  authDomain: "se3350-project-group38.firebaseapp.com",
  projectId: "se3350-project-group38",
  storageBucket: "se3350-project-group38.appspot.com",
  messagingSenderId: "165688153390",
  appId: "1:165688153390:web:2375fba1510c33412416bf"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };