import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from "./config.js"; // Ensure config.js exports the Firebase auth instance

// Check user authentication on page load
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn("Unauthorized access. Redirecting to login page.");
        window.location.href = "../index.html"; // Redirect to login page
    }
});

// Logout button logic with confirmation alert
document.getElementById("logout_btn").addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                console.log("User signed out successfully.");
                localStorage.clear();
                history.pushState(null, null, document.URL); // Prevent back navigation
                window.location.href = "../index.html"; // Redirect to index page
            })
            .catch((error) => {
                console.error("Error signing out:", error.message);
                alert("Failed to log out. Please try again.");
            });
    } else {
        console.log("Logout canceled.");
    }
});

// Prevent back navigation after logout
window.addEventListener("popstate", () => {
    history.pushState(null, null, document.URL);
});

