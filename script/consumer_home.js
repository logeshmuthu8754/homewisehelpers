import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from "./config.js"; // Ensure auth is imported correctly from your Firebase config

const consumerData = {
    Plumber: "../assets/images/plumber_img.jpg",
    Carpenter: "../assets/images/carpentar_img.jpg",
    Electrician: "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    Mason: "../assets/images/mason_img.jpg",
    "AC Technician": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "Acting Driver": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "Bike Mechanic": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "TV Technician": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "House Cleaner": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "Water Tank Cleaner": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    "Car Mechanic": "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
    Welder: "../assets/images/sample_img_all-photoaidcom-cropped.jpg",
};

// Populate roles on page load
const roleContainer = document.getElementById("roleContainer");
const searchBar = document.getElementById("searchBar");

// Function to render roles
function renderRoles(roleNames) {
    roleContainer.innerHTML = ""; // Clear existing roles
    roleNames.forEach((roleName) => {
        const div = document.createElement("div");
        div.className = "role";
        div.dataset.name = roleName;
        div.innerHTML = `
            <img class="role-logo" src="${consumerData[roleName]}" alt="${roleName}_img">
            <p class="role-link">${roleName} ></p>
        `;
        roleContainer.appendChild(div);

        // Add click event listener to each role
        div.addEventListener("click", () => {
            localStorage.setItem("searchedRole", roleName);
            window.location.href = "../pages/details.html";
        });
    });
}

// Function to filter and sort roles based on search input
function filterRoles() {
    const searchInput = searchBar.value.toLowerCase().trim();

    // Filter roles based on the search input
    const filteredRoles = Object.keys(consumerData).filter((roleName) =>
        roleName.toLowerCase().includes(searchInput)
    );

    // Sort roles alphabetically
    filteredRoles.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    // Display roles or show "No results found"
    if (filteredRoles.length > 0) {
        renderRoles(filteredRoles);
    } else {
        roleContainer.innerHTML = `<p style="color: red; text-align: center;">No results found</p>`;
    }
}

// Initial render of all roles sorted alphabetically on page load
document.addEventListener("DOMContentLoaded", () => {
    const allRoles = Object.keys(consumerData).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );
    renderRoles(allRoles);
});

// Add event listener to the search bar for filtering roles
searchBar.addEventListener("input", filterRoles);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.warn("Unauthorized access. Redirecting to login page.");
        window.location.href = "../index.html";
    }
});

// Logout button logic with confirmation
document.getElementById("logout_btn").addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                console.log("User signed out successfully.");
                localStorage.clear();
                history.pushState(null, null, document.URL); // Prevent back navigation
                window.location.href = "../index.html"; // Redirect to login page
            })
            .catch((error) => {
                console.error("Error signing out:", error.message);
                alert("Failed to log out. Please try again.");
            });
    } else {
        console.log("Logout canceled by user.");
    }
});

// Prevent back navigation after logout
window.addEventListener("popstate", () => {
    history.pushState(null, null, document.URL);
});

