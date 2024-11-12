// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVaNjFIWHCeYA8Tpxr_QL55TBIAyPPydU",
    authDomain: "home-wise-helpers.firebaseapp.com",
    projectId: "home-wise-helpers",
    storageBucket: "home-wise-helpers.firebaseapp.com",
    messagingSenderId: "542965182309",
    appId: "1:542965182309:web:5aa5d4fc51532d3b843b8c",
    measurementId: "G-TMQKDMXBHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Login form validation and authentication
document.addEventListener("DOMContentLoaded", function () {
    // Login form elements
    const loginForm = document.getElementById("Form"); // Assuming your login form has id="Form"
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const minLength = 8;

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent form from submitting by default

            // Clear previous error messages
            emailError.textContent = "";
            passwordError.textContent = "";
            let valid = true;

            // Validate email
            if (email.value.length === 0) {
                emailError.textContent = "Email required";
                valid = false;
            } else if (!validateEmail(email.value)) {
                emailError.textContent = "Please enter a valid email";
                valid = false;
            }

            // Validate password
            if (password.value.length === 0) {
                passwordError.textContent = "Password required";
                valid = false;
            } else if (password.value.length < minLength) {
                passwordError.textContent = `Password must be at least ${minLength} characters long.`;
                valid = false;
            }

            // If validation passes, proceed with Firebase authentication
            if (valid) {
                signInWithEmailAndPassword(auth, email.value, password.value)
                    .then((userCredential) => {
                        // Successful login
                        const user = userCredential.user;
                        alert("Login successful!");
                        window.location.href = "../pages/home.html"; // Redirect to dashboard or home page
                    })
                    .catch((error) => {
                        // Display error message from Firebase
                        const errorMessage = error.message;
                        alert(`Error: ${errorMessage}`);
                    });
            }
        });
    }

    // Toggle password visibility
    const togglePassword = document.querySelector("#togglePassword");
    if (togglePassword && password) {
        togglePassword.addEventListener("click", function () {
            const type = password.getAttribute("type") === "password" ? "text" : "password";
            password.setAttribute("type", type);
            this.innerHTML = type === "password" ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
});
