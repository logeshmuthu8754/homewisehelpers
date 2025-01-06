import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
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
let selectedDate;
let workerId;
let workerName;

const tomorrowDate = () => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; 
    const istTime = new Date(now.getTime() + offset);
    istTime.setDate(istTime.getDate() + 1);
    return istTime.toISOString().split("T")[0];
};
const fourDaysLater = () => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; 
    const istTime = new Date(now.getTime() + offset);
    istTime.setDate(istTime.getDate() + 4);
    return istTime.toISOString().split("T")[0];
};
const calendar = document.getElementById("calendar");
calendar.setAttribute("min", tomorrowDate());
calendar.setAttribute("max", fourDaysLater());
calendar.setAttribute("value", tomorrowDate());

selectedDate=tomorrowDate()

const searchedRole = localStorage.getItem("searchedRole");

let currentUserId ;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId=user.uid
      console.log("User UID:", user.uid);
    } else {
      console.log("No user signed in");
    }
  });

// Consumer - Slot Booking Page
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pageTitle").innerText = searchedRole;
    fetchData();
});

// Fetch workers based on role and render them
async function fetchData() {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", searchedRole), where("userType", "==", "worker"));

    try {
        const querySnapshot = await getDocs(q);
        const workers = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            workers.push({ id: doc.id, ...data });
        });
        renderWorkers(workers);
    } catch (error) {
        console.error("Error fetching workers:", error);
    }
}

function renderWorkers(workers) {
    const workerDetailsContainer = document.getElementById("workerDetails");
    workerDetailsContainer.innerHTML = "";
    workers.forEach((worker) => {
        const div = document.createElement("div");
        div.className = "workerCard";
        div.innerHTML = `
            <img id="profilimg_worker" src="../assets/images/userImage.png" alt="Profile Image">
        <div class="workerContent">
            <div class="workerDetails">
                <p><strong>Worker Name:</strong> <span>${worker.name}</span></p>
                <p><strong>Address:</strong> <span>${worker.address}</span></p>
                <p><strong>Email:</strong> <span>${worker.email}</span></p>
            </div>
            <button class="book_now" data-worker-id="${worker.id}" data-worker-name="${worker.name}">Book Now</button>
        </div>`;
        workerDetailsContainer.appendChild(div);
    });

    document.querySelectorAll(".book_now").forEach((button) => {
        button.addEventListener("click", (e) => {
            workerId = e.target.dataset.workerId;
            workerName = e.target.dataset.workerName;
            openBookingPopup();
        });
    });
}
async function sendBookingRequest(slotTime) {
    try {
        // Query to check if the slot already exists

  
        const q = query(
            collection(db, "requests"),
            where("workerId", "==", workerId),
            where("slotTime", "==", slotTime),
            where("userId","==",currentUserId),
            where("date","==",selectedDate)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const existingStatus = existingDoc.data().status;

            // if (existingStatus !== "available") {
            //     alert("This slot is not available. Please choose another slot.");
            //     return;
            // }

            // If slot exists and is available, update its status to "pending"
            await updateDoc(existingDoc.ref, {
                userId: currentUserId,
                status: "pending",
            });

            alert(`Booking request sent to ${workerName} for ${slotTime}.`);
            return;
        }

        // If slot does not exist, create a new entry
        await addDoc(collection(db, "requests"), {
            userId: currentUserId,
            workerId,
            workerName,
            slotTime,
            status: "pending",
            date:selectedDate,
        });
        alert(`Booking request sent to ${workerName} for ${slotTime}.`);
        openBookingPopup()

    } catch (error) {
        console.error("Error handling booking request:", error);
    }
}



calendar.addEventListener("change", (event) => {
    selectedDate=event.target.value;
    openBookingPopup()
  });

const defaultSlots = [
    { display: "9:00 AM-10:00 AM", dbFormat: "9-10" },
    { display: "10:00 AM-11:00 AM", dbFormat: "10-11" },
    { display: "11:00 AM-12:00 PM", dbFormat: "11-12" },
    { display: "12:00 PM-1:00 PM", dbFormat: "12-1" },
    { display: "1:00 PM-2:00 PM", dbFormat: "1-2" },
    { display: "2:00 PM-3:00 PM", dbFormat: "2-3" },
    { display: "3:00 PM-4:00 PM", dbFormat: "3-4" },
    { display: "4:00 PM-5:00 PM", dbFormat: "4-5" }
];

function openBookingPopup() {
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const slotsContainer = document.getElementById("slotsContainer");

    // Clear previous slots and open the popup
    slotsContainer.innerHTML = "";
    popupOverlay.classList.remove("hidden");

    // Close popup logic
    closePopup.addEventListener("click", () => {
        popupOverlay.classList.add("hidden");
    });

    // Query worker's availability and requests for the selected date
    const availabilityQuery = query(
        collection(db, "workerSlots"),
        where("workerId", "==", workerId),
        where("date", "==", selectedDate)
    );
    const requestsQuery = query(
        collection(db, "requests"),
        where("workerId", "==", workerId),
        where("date", "==", selectedDate)
    );

    // Set to track occupied slots
    const workerSlotStatus = new Set();

    // Real-time updates for availability
    onSnapshot(availabilityQuery, (availabilitySnapshot) => {
        workerSlotStatus.clear();
        availabilitySnapshot.forEach((doc) => {
            const workerSlot = doc.data();
            workerSlotStatus.add(workerSlot.slotTime);
        });

        // Fetch requests and render slots
        getDocs(requestsQuery).then((requestSnapshot) => {
            const slotStatusMap = {}; // Map to track slot statuses

            requestSnapshot.forEach((doc) => {
                const request = doc.data();
                console.log("Request Data:", request);
    
                // If the current user is not the one in the request
                if (currentUserId !== request.userId) {
                    // Handle rejected request: Mark the slot as available for others
                    if (request.status === "rejected"||request.status=="pending") {
                        slotStatusMap[request.slotTime] = "available"; 
                    }
                    else {
                        // Handle accepted request: Mark the slot as unavailable for all users
                        if (request.status === "accepted") {
                            slotStatusMap[request.slotTime] = "unavailable"; 
                            console.log(`Slot marked as unavailable due to accepted request for slot ${request.slotTime}`);
                        } else if (!slotStatusMap[request.slotTime]) {
                            // Only update status if it's not already set (to avoid overwriting "unavailable")
                            slotStatusMap[request.slotTime] = request.status;
                        }
                    }
                } else {
                    // If the userId is the same as the current user, use the request's actual status
                    slotStatusMap[request.slotTime] = request.status; 
                }
            });

            // Render slots with statuses
            renderSlots(slotStatusMap, workerSlotStatus);
        });
    });
}
// Helper function to render slots
function renderSlots(slotStatusMap, workerSlotStatus) {
    const slotsContainer = document.getElementById("slotsContainer");

    slotsContainer.innerHTML = "";
    defaultSlots.forEach(({ display, dbFormat }) => {
        let status = "available";  // Default status

        // First, check if any request has marked the slot as unavailable due to "accepted" status
        if (slotStatusMap[dbFormat] === "unavailable") {
            status = "unavailable"; // Slot is unavailable due to accepted request
        } else if (workerSlotStatus.has(dbFormat)) {
            // Check if the worker has set the slot as unavailable
            status = "unavailable";  // Mark as unavailable if found in worker availability
        } else if (slotStatusMap[dbFormat] === "accepted") {
            status = "accepted";  // Slot is already booked (accepted)
        } else if (slotStatusMap[dbFormat] === "rejected") {
            status = "rejected";  // Slot was rejected
        }
        else if(slotStatusMap[dbFormat]=="pending"){
            status="pending"
        }
        else if(slotStatusMap[dbFormat]=="rejectedForSomeOne"){
            status="rejected"
        }

        const slotDiv = document.createElement("div");
        slotDiv.className = "slot-btn";

        // Set the slot background and text based on the status
        if (status === "available") {
            slotDiv.style.backgroundColor = "green";
            slotDiv.textContent = `${display} - Available`;
            slotDiv.addEventListener("click", () => {
                sendBookingRequest(dbFormat);
            });
        } else if (status === "unavailable") {
            slotDiv.style.backgroundColor = "gray";
            slotDiv.style.cursor = "not-allowed";
            slotDiv.textContent = `${display} - Unavailable`;
        } else if (status === "accepted") {
            slotDiv.style.backgroundColor = "gray";
            slotDiv.style.cursor = "not-allowed";
            slotDiv.textContent = `${display} - Booked`;
        } else if (status === "rejected") {
            slotDiv.style.backgroundColor = "red";
            slotDiv.style.cursor = "not-allowed";
            slotDiv.textContent = `${display} - Rejected`;
        }
        else if(status==="pending"){
            slotDiv.style.backgroundColor = "blue";
            slotDiv.style.cursor = "not-allowed";
            slotDiv.textContent = `${display} - waiting For Worker`;
        }
        else {
            slotDiv.style.backgroundColor = "blue";
            slotDiv.style.cursor = "not-allowed";
            slotDiv.textContent = `${display} - Waiting for confirmation`;
        }

        slotsContainer.appendChild(slotDiv);
    });
}
