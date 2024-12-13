import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const searchedRole = localStorage.getItem("searchedRole")
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("pageTitle").innerText = searchedRole;
    fetchData()


})

function fetchData() {
    // Function to fetch workers with role "Welder" and userType "worker"
    async function fetchWeldersAndWorkers() {
        const usersRef = collection(db, "users"); // Reference to the users collection
        const q = query(
            usersRef,
            where("role", "==", searchedRole),
            where("userType", "==", "worker")
        );

        try {
            const querySnapshot = await getDocs(q);
            const welders = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                welders.push({ id: doc.id, ...data });
            });

            console.log("Welders who are workers:", welders); // Output fetched welders
            return welders;
        } catch (error) {
            console.error("Error fetching welders who are workers:", error);
        }
    }

    const workerDetailsContainer = document.getElementById("workerDetails");
    // Fetch welders and use their data
    fetchWeldersAndWorkers().then((welders) => {
        welders.forEach((welder) => {
            const div = document.createElement("div");
            div.className = "workerCard"
            div.innerHTML = `     
            <img id="profilimg_worker" src="../assets/images/profile_img.webp" alt="profile img">
            <div class="workerDetails">
               <p id="workernamecontainer">Worker name : <span id="welderName">${welder.name}</span></p>
                <p id="workernamecontainer">Worker Address : <span id="welderAddress">${welder.address}</span></p>
                <p id="workernamecontainer">Worker Email : <span id="welderEmail">${welder.email}</span></p>
            </div>
`
            workerDetailsContainer.appendChild(div);
        });
    });
}


