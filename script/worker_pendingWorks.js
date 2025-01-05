import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,getDoc,
  doc,
  onSnapshot,
  updateDoc,
  
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const yesterday = () => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; 
    const istTime = new Date(now.getTime() + offset);
    istTime.setDate(istTime.getDate() -1);
    return istTime.toISOString().split("T")[0];
};


let currentUserId ;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId=user.uid
      console.log("User UID:", user.uid);
      initializeWorkersData(currentUserId);

    } else {
      console.log("No user signed in");
    }
  });


  let slots={
    "9-10": "9:00 AM-10:00 AM",
    "10-11": "10:00 AM-11:00 AM",
    "11-12": "11:00 AM-12:00 AM",
    "12-1": "12:00 PM-1:00 PM",
    "1-2": "1:00 PM-2:00 PM",
    "2-3": "2:00 PM-3:00 PM",
    "3-4": "3:00 PM-4:00 PM",
    "4-5": "4:00 PM-5:00 PM"
}


function isTimePassed(date, slotTime) {
    console.log(date,slotTime);
    
    const [startHour, endHour] = slotTime.split("-").map(Number); // Extract start and end hours
    const scheduledDate = new Date(date); // Convert date string to Date object
    const now = new Date(); // Current date and time

    // Set the scheduled start time
    scheduledDate.setHours(startHour, 0, 0, 0); // Set the start hour, minute, second, millisecond

    return now >= scheduledDate; // Check if the current time is past the scheduled start time
}


// Initialize worker request listener
function initializeWorkersData(workerId) {
    const requestList = document.getElementById("pendingWorksList");

    async function handleMarkCompleted(requestId, date, slotTime) {
        if (!isTimePassed(date, slotTime)) {
            alert("You cannot mark this request as completed until the scheduled time has passed.");
            return;
        }
    
        try {
            await updateDoc(doc(db, "requests", requestId), {
                status: "completed", // Update request status
            });
            alert("Request has been marked as completed.");
        } catch (error) {
            console.error("Error marking request as completed:", error);
        }
    }
    
    // Function to handle marking a request as not completed
    async function handleMarkNotCompleted(requestId, date, slotTime) {
        if (!isTimePassed(date, slotTime)) {
            alert("You cannot mark this request as not completed until the scheduled time has passed.");
            return;
        }
    
        try {
            await updateDoc(doc(db, "requests", requestId), {
                status: "not completed", // Update request status
            });
            alert("Request has been marked as not completed.");
        } catch (error) {
            console.error("Error marking request as not completed:", error);
        }
    }
    
    // Real-time listener for requests
    const qu = query(
        collection(db, "requests"),
        where("workerId", "==", workerId), // Filter requests for the current worker
        where("status", "==", "accepted") // Only fetch pending requests
    );

    async function fetchUserData(userId) {
        const qForUser = doc(db, "users", userId);
        try {
            const docSnapshot = await getDoc(qForUser);
            if (docSnapshot.exists()) {
                return docSnapshot.data();
            } else {
                console.log("No such document!");
                return null;
            }
        } catch (error) {
            console.error("Error getting document:", error);
            return null;
        }
    }

    onSnapshot(qu, async (snapshot) => {
        requestList.innerHTML = ""; // Clear previous entries

        for (const doc of snapshot.docs) {
            const request = doc.data();
            console.log(request);
            

            // Wait for user data to be fetched
            const userData = await fetchUserData(request.userId);
            console.log(userData);

            const userName = userData ? userData.name : "Unknown";
            const userAddress = userData.address;
            const slotTime = request.slotTime;
            const slotDate = request.date;

            // Create the card HTML structure
            const listItem = document.createElement("li");
            listItem.classList.add("request-card");

            listItem.innerHTML = `
            <div class="details">
              <p>Slot: ${slots[slotTime]}</p>
              <p>Date: ${slotDate}</p>
              <p>User: ${userName}</p>
              <p>Address: ${userAddress}</p>
            </div>
            <div class="buttons">
              <button id="completed-${request.id}">Completed</button>
              <button id="not-completed-${request.id}">Not Completed</button>
            </div>
          `;

            // Attach event listeners to buttons
            const completedBtn = listItem.querySelector(
                `#completed-${request.id}`
            );
            const notCompletedBtn = listItem.querySelector(
                `#not-completed-${request.id}`
            );

            completedBtn.addEventListener("click", () =>
                handleMarkCompleted(doc.id, slotDate, slotTime)
            );
            notCompletedBtn.addEventListener("click", () =>
                handleMarkNotCompleted(doc.id, slotDate, slotTime)
            );
    

            requestList.appendChild(listItem); // Append the list item (card) to the list
        }
    });
}
