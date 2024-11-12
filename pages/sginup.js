// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

// Form validation and Firebase authentication
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("myForm");

    // Input elements
    const name = document.getElementById("name");
    const email = document.getElementById("email_sgin");
    const password = document.getElementById("password_sgin");
    const confirmPassword = document.getElementById("password_sgin_con");
    const address = document.getElementById("address");

    // Error message elements
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error-sgin");
    const passwordError = document.getElementById("password-error-sgin");
    const confirmPasswordError = document.getElementById("password-error-con");
    const addressError = document.getElementById("address-error");

    const minLength = 8;

    // Function to validate each field
    function validateName() {
        if (name.value.trim().length < 2) {
            nameError.textContent = "Name must be at least 2 characters.";
            return false;
        } else {
            nameError.textContent = "";
            return true;
        }
    }
    function validateEmailInput() {
        const emailValue = email.value.trim();
        const emailErrorMessage = "Please enter a valid email with exactly three characters after the last dot.";
    
        if (emailValue.length === 0) {
            emailError.textContent = "Email required.";
            return false;
        } else if (!validateEmail(emailValue)) {
            emailError.textContent = "Please enter a valid email.";
            return false;
        } else {
            // Check if there are exactly three characters after the last dot
            const lastDotIndex = emailValue.lastIndexOf(".");
            const domainPart = emailValue.slice(lastDotIndex + 1);
    
            if (domainPart.length !== 3) {
                emailError.textContent = emailErrorMessage;
                return false;
            } else {
                emailError.textContent = "";
                return true;
            }
        }
    }
    

    function validatePassword() {
        const minLength = 8;
        const maxLength = 30;
        const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/; // Regular expression to check for special characters
    
        if (password.value.trim().length < minLength || password.value.trim().length > maxLength) {
            passwordError.textContent = `Password must be between ${minLength} and ${maxLength} characters long.`;
            return false;
        } else if (!specialCharPattern.test(password.value)) {
            passwordError.textContent = "Password must contain at least one special character (e.g., !, @, #, $).";
            return false;
        } else {
            passwordError.textContent = "";
            return true;
        }
    }
    

    function validateConfirmPassword() {
        if (confirmPassword.value !== password.value) {
            confirmPasswordError.textContent = "Passwords do not match.";
            return false;
        } else {
            confirmPasswordError.textContent = "";
            return true;
        }
    }

    function validateAddress() {
        if (address.value.trim().length === 0) {
            addressError.textContent = "Address required.";
            return false;
        } else {
            addressError.textContent = "";
            return true;
        }
    }

    // Add event listeners for real-time validation
    name.addEventListener("input", validateName);
    email.addEventListener("input", validateEmailInput);
    password.addEventListener("input", validatePassword);
    confirmPassword.addEventListener("input", validateConfirmPassword);
    address.addEventListener("input", validateAddress);

    // Full form validation and Firebase signup on submit
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Run all validation functions
        const isFormValid = validateName() && validateEmailInput() && validatePassword() && validateConfirmPassword() && validateAddress();

        // If form is valid, proceed with Firebase Authentication
        if (isFormValid) {
            createUserWithEmailAndPassword(auth, email.value, password.value)
                .then((userCredential) => {
                    // User created successfully
                    const user = userCredential.user;
                    alert("Signup successful! You can now log in.");
                    window.location.href = "../pages/login.html"; 
                })
                .catch((error) => {
                    // Display Firebase error message
                    const errorMessage = error.message;
                    alert(`Error: ${errorMessage}`);
                });
        }
    });
});



 // Toggle password visibility in the login form
 const togglePassword = document.querySelector("#togglePassword");
 if (togglePassword && password) {
     togglePassword.addEventListener("click", function () {
         const type = password.getAttribute("type") === "password" ? "text" : "password";
         password.setAttribute("type", type);
         // Change the icon based on the password field type
         this.innerHTML = type === "password" ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
     });
 }

