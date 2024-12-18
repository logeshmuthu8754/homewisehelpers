import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";





// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDVaNjFIWHCeYA8Tpxr_QL55TBIAyPPydU",
    authDomain: "home-wise-helpers.firebaseapp.com",
    projectId: "home-wise-helpers",
    storageBucket: "home-wise-helpers.appspot.com",
    messagingSenderId: "542965182309",
    appId: "1:542965182309:web:5aa5d4fc51532d3b843b8c",
    measurementId: "G-TMQKDMXBHN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
