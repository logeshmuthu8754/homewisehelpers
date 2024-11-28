import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userTypeInput = document.getElementById("userType");
const togglePassword = document.getElementById("togglePassword");

// Error Elements
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const userTypeError = document.getElementById("userType-error");

// Toggle Password Visibility
togglePassword.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
});

// Validate Email Format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email format
    return emailRegex.test(email);
};

// Form Validation
const validateLoginForm = () => {
    let isValid = true;

    // Clear previous error messages
    emailError.textContent = "";
    passwordError.textContent = "";
    userTypeError.textContent = "";

    // Email Validation
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
        emailError.textContent = "Email is required.";
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        emailError.textContent = "Invalid email format.";
        isValid = false;
    }

    // Password Validation
    const passwordValue = passwordInput.value.trim();
    if (!passwordValue) {
        passwordError.textContent = "Password is required.";
        isValid = false;
    }

    // User Type Validation
    if (!userTypeInput.value) {
        userTypeError.textContent = "Please select a user type.";
        isValid = false;
    }

    return isValid;
};

// Clear Error Messages Dynamically
emailInput.addEventListener("input", () => {
    emailError.textContent = "";
});
passwordInput.addEventListener("input", () => {
    passwordError.textContent = "";
});
userTypeInput.addEventListener("change", () => {
    userTypeError.textContent = "";
});

// Login Form Submission
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateLoginForm()) return;

    try {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const userType = userTypeInput.value;

        // Authenticate User with Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check User Type in Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.userType === userType) {
                // Redirect based on userType
                if (userType === "worker") {
                    alert("Worker Login Successful!");
                    window.location.href = "./pages/home.html"; // Redirect to worker home page
                } else if (userType === "user") {
                    alert("User Login Successful!");
                    window.location.href = "./pages/userhome.html"; // Redirect to user home page
                }
            } else {
                userTypeError.textContent = "Invalid user type for this account.";
            }
        } else {
            emailError.textContent = "Account not found.";
        }
    } catch (error) {
        // Handle specific Firebase errors
        if (error.code === "auth/user-not-found") {
            emailError.textContent = "No account found with this email.";
        } else if (error.code === "auth/wrong-password") {
            passwordError.textContent = "Incorrect password.";
        } else {
            passwordError.textContent = "An error occurred. Please try again.";
        }
    }
});
