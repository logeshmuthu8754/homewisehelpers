// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    query,
    where,
    collection,
    onSnapshot,
    updateDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);
let email = ""
// Redirect unauthorized users and initialize worker-specific logic
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn("Unauthorized access. Redirecting to login page.");
        window.location.href = "../index.html";
    } else {
        const workerId = user.uid;
        email = user.email // Get authenticated worker's ID
        console.log("Authenticated worker ID:", workerId);
        console.log(email)
        initializeWorkerRequests(workerId); // Pass workerId to the function
    }
});

// Logout functionality
document.getElementById("logout_btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        signOut(auth)
            .then(() => {
                localStorage.clear();
                window.location.href = "../index.html";
            })
            .catch((error) => console.error("Error signing out:", error.message));
    }
});

// Initialize worker request listener
function initializeWorkerRequests(workerId) {
    const requestList = document.getElementById("requestList");

    function renderRequest(requestId, time, userName) {
        const listItem = document.createElement("li");
        listItem.textContent = `Slot: ${time} | User: ${userName}`;
        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "Accept";
        acceptBtn.addEventListener("click", () => handleAccept(requestId, time));

        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "Reject";
        rejectBtn.addEventListener("click", () => handleReject(requestId));

        listItem.appendChild(acceptBtn);
        listItem.appendChild(rejectBtn);
        requestList.appendChild(listItem);
    }

    async function handleAccept(requestId, time) {
        try {
            await updateDoc(doc(db, "requests", requestId), {
                status: "accepted", // Update request status
                booked: true,
            });
            alert(`Slot "${time}" has been accepted.`);
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    }

    async function handleReject(requestId) {
        try {
            await updateDoc(doc(db, "requests", requestId), {
                status: "rejected", // Update request status
            });
            alert("Request has been rejected.");
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    }

    // Real-time listener for requests
    const qu = query(
        collection(db, "requests"),
        where("workerId", "==", workerId) // Filter requests for the current worker
    );

    onSnapshot(qu, (snapshot) => {
        requestList.innerHTML = ""; // Clear previous entries
        snapshot.forEach((doc) => {
            const request = doc.data();
            console.log(request);
            renderRequest(doc.id, request.slotTime);
        });
    });

    // const q = query(
    //     collection(db, "users"),
    //     where("email", "==", email) // Filter requests for the current worker
    // );

    // onSnapshot(q, (snapshot) => {
    //     requestList.innerHTML = ""; // Clear previous entries
    //     snapshot.forEach((doc) => {
    //         const request = doc.data();
    //         console.log(request);
            
    //         renderRequest(doc.id,  request.slotTime ,request.name);
    //     });
    // });
}
// Worker - Request Handling
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn("Unauthorized access. Redirecting to login page.");
        window.location.href = "../index.html";
    } else {
        initializeWorkerRequests(user.uid);
    }
});

document.getElementById("logout_btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        signOut(auth)
            .then(() => {
                localStorage.clear();
                window.location.href = "../index.html";
            })
            .catch((error) => console.error("Error signing out:", error.message));
    }
});

