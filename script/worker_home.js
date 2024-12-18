
import {  onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { auth,db } from "./config.js";



// Logout button logic
document.getElementById("logout_btn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            console.log("User signed out successfully.");
            localStorage.clear();
            window.location.href = "/index.html"
        })
        .catch((error) => {
            console.error("Error signing out:", error.message);
            alert("Failed to log out. Please try again.");
        });
});
