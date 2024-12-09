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
const auth = getAuth(app);
const db = getFirestore(app);



// Function to retrieve worker profile from Firestore
async function getWorkerProfile(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

// Function to display worker profile on the webpage
function displayWorkerProfile(workerData) {
    if (!workerData) {
        console.log("No worker data to display.");
        return;
    }

    const profileContainer = document.getElementById('profileContainer');
    profileContainer.innerHTML = ''; // Clear any existing content

    const nameElement = document.createElement('h2');
    nameElement.textContent = `Name: ${workerData.name}`;
    profileContainer.appendChild(nameElement);

    const emailElement = document.createElement('p');
    emailElement.textContent = `Email: ${workerData.email}`;
    profileContainer.appendChild(emailElement);

    const addressElement = document.createElement('p');
    addressElement.textContent = `Address: ${workerData.address}`;
    profileContainer.appendChild(addressElement);

    const roleElement = document.createElement('p');
    roleElement.textContent = `Role: ${workerData.role}`;
    profileContainer.appendChild(roleElement);
}

// Monitor authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        getWorkerProfile(user.uid).then(workerData => {
            displayWorkerProfile(workerData);
        });
    } else {
        console.log("No user is signed in.");
    }
});
