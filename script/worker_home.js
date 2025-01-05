// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    query,
    where,
    collection,
    onSnapshot,
    updateDoc,getDoc,addDoc,getDocs,
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


    async function handleAccept(requestId, time, workerId, selectedDate, userId) {
        console.log("Handling accept for requestId:", requestId); 
    
        if (!requestId) {
            console.error("Request ID is missing or invalid.");
            return;
        }
    
        try {
            // Step 1: Accept the current request
            await updateDoc(doc(db, "requests", requestId), {
                status: "accepted", // Update request status
                booked: true,
            });
            await addDoc(collection(db, "workerSlots"), {
                workerId: workerId,
                slotTime: time,
                selectedDate,
                userId
            });
            console.log("New worker slot document created.");
            alert(`Slot "${time}" has been accepted.`);
    
            // Step 2: Reject all other requests for the same time slot
            const qForConflictingRequests = query(
                collection(db, "requests"),
                where("workerId", "==", workerId),
                where("slotTime", "==", time),
                where("date","==",selectedDate),
                where("status", "==", "pending") // Only target pending requests
            );
    
            const snapshot = await getDocs(qForConflictingRequests);
            snapshot.forEach(async (conflictingDoc) => {
                console.log(conflictingDoc);
                
                const conflictingRequestId = conflictingDoc.id;
                await updateDoc(doc(db, "requests", conflictingRequestId), {
                    status: "rejectedForSomeOne", // Reject the conflicting request
                });
                console.log(`Request with ID ${conflictingRequestId} has been rejected.`);
            });
    
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    }
    
    

    // Function to handle reject button
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
          if(request.status=="pending"){
            // Wait for user data to be fetched
          const userData = await fetchUserData(request.userId);
          console.log(userData);
          
        const userName = userData ? userData.name : 'Unknown';
        const userAddress = userData.address;
        const slotTime = request.slotTime;
        const slotDate = request.date;
  
        // Create the card HTML structure
        const listItem = document.createElement("li");
        listItem.classList.add("request-card");
  
        listItem.innerHTML = `
          <div class="details">
            <p>Slot: ${slots[slotTime]}</p>
            <p>Slot: ${slotDate}</p>
            <p>User: ${userName}</p>
            <p>Address: ${userAddress}</p>
          </div>
          <div class="buttons">
            <button id="accept-${request.id}">Accept</button>
            <button id="reject-${request.id}">Reject</button>
          </div>
        `;
  
        // Attach event listeners to buttons
        const acceptBtn = listItem.querySelector(`#accept-${request.id}`);
        const rejectBtn = listItem.querySelector(`#reject-${request.id}`);
        console.log(request);
        
        
        acceptBtn.addEventListener("click", () => handleAccept(doc.id, request.slotTime,request.workerId,request.date,request.userId));
        rejectBtn.addEventListener("click", () => handleReject(doc.id));
  
        requestList.appendChild(listItem); // Append the list item (card) to the list
          }
          
        }
      });
    


}


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

