import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDVaNjFIWHCeYA8Tpxr_QL55TBIAyPPydU",
    authDomain: "home-wise-helpers.firebaseapp.com",
    projectId: "home-wise-helpers",
    storageBucket: "home-wise-helpers.firebasestorage.app",
    messagingSenderId: "542965182309",
    appId: "1:542965182309:web:5aa5d4fc51532d3b843b8c",
    measurementId: "G-TMQKDMXBHN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const signupForm = document.getElementById("signupForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const userType = document.getElementById("userType");
const workerRoleContainer = document.getElementById("workerRoleContainer");
const role = document.getElementById("role");

// Error Elements
const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmPasswordError = document.getElementById("confirmPassword-error");
const userTypeError = document.getElementById("userType-error");
const roleError = document.getElementById("role-error");

// Show/Hide Worker Role Dropdown
userType.addEventListener("change", () => {
    workerRoleContainer.style.display = userType.value === "worker" ? "block" : "none";
});

// Field Validation Functions
const validateName = () => {
    if (!nameInput.value.trim()) {
        nameError.textContent = "Full name is required.";
        return false;
    } else if (nameInput.value.trim().length < 2) {
        nameError.textContent = "Name must be at least 2 characters.";
        return false;
    }
    nameError.textContent = "";
    return true;
};

const validateEmail = () => {
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
        emailError.textContent = "Email is required.";
        return false;
    } else if (!emailValue.endsWith("@gmail.com")) {
        emailError.textContent = "Email must end with '@gmail.com'.";
        return false;
    } else if (emailValue.match(/@gmail.com.*@gmail.com/)) {
        emailError.textContent = "Invalid email format.";
        return false;
    }
    emailError.textContent = "";
    return true;
};

const validatePassword = () => {
    const passwordValue = passwordInput.value.trim();
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/; // Special character check
    if (!passwordValue) {
        passwordError.textContent = "Password is required.";
        return false;
    } else if (passwordValue.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters.";
        return false;
    } else if (!specialCharRegex.test(passwordValue)) {
        passwordError.textContent = "Password must include at least one special character.";
        return false;
    }
    passwordError.textContent = "";
    return true;
};

const validateConfirmPassword = () => {
    if (!confirmPasswordInput.value.trim()) {
        confirmPasswordError.textContent = "Please confirm your password.";
        return false;
    } else if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
        confirmPasswordError.textContent = "Passwords do not match.";
        return false;
    }
    confirmPasswordError.textContent = "";
    return true;
};

const validateUserType = () => {
    if (!userType.value) {
        userTypeError.textContent = "Please select a user type.";
        return false;
    }
    userTypeError.textContent = "";
    return true;
};

const validateRole = () => {
    if (userType.value === "worker" && !role.value) {
        roleError.textContent = "Please select a role.";
        return false;
    }
    roleError.textContent = "";
    return true;
};

// Add Input Event Listeners to Dynamically Validate
nameInput.addEventListener("input", validateName);
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePassword);
confirmPasswordInput.addEventListener("input", validateConfirmPassword);
userType.addEventListener("change", validateUserType);
role.addEventListener("input", validateRole);

// Form Validation
const validateSignupForm = () => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    const isUserTypeValid = validateUserType();
    const isRoleValid = validateRole();

    return (
        isNameValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmPasswordValid &&
        isUserTypeValid &&
        isRoleValid
    );
};

// Signup Form Submission
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateSignupForm()) {
        console.log("Form validation failed.");
        return; // Stop the process if validation fails
    }

    try {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: nameInput.value.trim(),
            email: email,
            userType: userType.value,
            role: userType.value === "worker" ? role.value : null,
        });

        alert("Signup successful!");
        window.location.href = "./login.html";
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

