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
const app = initializeApp(firebaseConfig); // Initialize Firebase App
const auth = getAuth(app); // Pass the app instance to getAuth
const db = getFirestore(app); // Initialize Firestore

console.log("Firebase initialized successfully!");

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
            const workerId = e.target.dataset.workerId;
            const workerName = e.target.dataset.workerName;
            openBookingPopup(workerId, workerName);
        });
    });
}

async function sendBookingRequest(workerId, workerName, slotTime) {
    try {
        // Query to check if the slot already exists
        const q = query(
            collection(db, "requests"),
            where("workerId", "==", workerId),
            where("slotTime", "==", slotTime)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const existingDoc = querySnapshot.docs[0];
            const existingStatus = existingDoc.data().status;

            if (existingStatus !== "available") {
                alert("This slot is not available. Please choose another slot.");
                return;
            }

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
            status: "pending", // Set initial status
        });

        alert(`Booking request sent to ${workerName} for ${slotTime}.`);
    } catch (error) {
        console.error("Error handling booking request:", error);
    }
}




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


function openBookingPopup(workerId, workerName) {
    const popupOverlay = document.getElementById("popupOverlay");
    const closePopup = document.getElementById("closePopup");
    const slotsContainer = document.getElementById("slotsContainer");

    popupOverlay.classList.remove("hidden");

    closePopup.addEventListener("click", () => {
        popupOverlay.classList.add("hidden");
    });

    const q = query(collection(db, "requests"), where("workerId", "==", workerId));

    onSnapshot(q, async (snapshot) => {
        // Create a map for slot statuses
        const slotStatusMap = {};
        snapshot.forEach((doc) => {
            const request = doc.data();
            slotStatusMap[request.slotTime] = request.status;
        });

        // Render slots with updated statuses
        slotsContainer.innerHTML = "";
        defaultSlots.forEach(({ display, dbFormat }) => {
            const status = slotStatusMap[dbFormat] || "available";
            const slotDiv = document.createElement("div");
            slotDiv.className = "slot-btn";

            if (status === "available") {
                slotDiv.style.backgroundColor = "green";
                slotDiv.textContent = `${display} - Available`;
                slotDiv.addEventListener("click", () => {
                    sendBookingRequest(workerId, workerName, dbFormat);
                });
            } else if (status === "accepted") {
                slotDiv.style.backgroundColor = "gray";
                slotDiv.style.cursor = "not-allowed";
                slotDiv.textContent = `${display} - Booked`;
            } else if (status === "rejected") {
                slotDiv.style.backgroundColor = "red";
                slotDiv.style.cursor = "not-allowed";
                slotDiv.textContent = `${display} - Rejected`;
            } else {
                slotDiv.style.backgroundColor = "blue";
                slotDiv.style.cursor = "not-allowed";
                slotDiv.textContent = `${display} - Waiting for confirmation`;
            }

            slotsContainer.appendChild(slotDiv);
        });
    });
}
