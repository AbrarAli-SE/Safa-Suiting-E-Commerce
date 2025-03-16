// profileValidation.js
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const messageContainer = document.getElementById('message-container');
    const navWelcomeName = document.getElementById('nav-welcome-name');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    // Fetch latest user data on page load
    async function loadUserData() {
        try {
            const response = await fetch("/user/profile-data", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            const result = await response.json();
            if (response.ok) {
                nameInput.value = result.user.name;
                emailInput.value = result.user.email;
                navWelcomeName.textContent = result.user.name;
            } else {
                console.error("❌ Fetch User Data Error:", result.error);
            }
        } catch (error) {
            console.error("❌ AJAX Fetch User Data Error:", error);
        }
    }

    // Load user data on page load
    loadUserData();

    // Validation Functions
    function validateName() {
        const value = nameInput.value.trim();
        if (value.length < 3) {
            nameError.textContent = "Name must be at least 3 characters long.";
            nameError.classList.remove('hidden');
            return false;
        }
        nameError.classList.add('hidden');
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailPattern.test(value)) {
            emailError.textContent = "Enter a valid Gmail address.";
            emailError.classList.remove('hidden');
            return false;
        }
        emailError.classList.add('hidden');
        return true;
    }

    function validateCurrentPassword() {
        const value = currentPassword.value.trim();
        if (value.length === 0) {
            currentPasswordError.textContent = "Current password is required.";
            currentPasswordError.classList.remove('hidden');
            return false;
        }
        currentPasswordError.classList.add('hidden');
        return true;
    }

    function validateNewPassword() {
        const value = newPassword.value.trim();
        if (value.length < 6) {
            newPasswordError.textContent = "Password must be at least 6 characters long.";
            newPasswordError.classList.remove('hidden');
            return false;
        }
        newPasswordError.classList.add('hidden');
        return true;
    }

    function validateConfirmPassword() {
        const value = confirmPassword.value.trim();
        if (value !== newPassword.value) {
            confirmPasswordError.textContent = "Passwords do not match.";
            confirmPasswordError.classList.remove('hidden');
            return false;
        }
        confirmPasswordError.classList.add('hidden');
        return true;
    }

    // Input Listeners
    nameInput.addEventListener('input', validateName);
    emailInput.addEventListener('input', validateEmail);
    currentPassword.addEventListener('input', validateCurrentPassword);
    newPassword.addEventListener('input', validateNewPassword);
    confirmPassword.addEventListener('input', validateConfirmPassword);

    // AJAX Profile Update
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!validateName() || !validateEmail()) return;

        const formData = new FormData(profileForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("/user/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            const result = await response.json();
            messageContainer.innerHTML = "";

            if (response.ok) {
                showMessage(result.message, "success");
                nameInput.value = result.user.name;
                emailInput.value = result.user.email;
                navWelcomeName.textContent = result.user.name;
            } else {
                showMessage(result.error || "An error occurred.", "error");
            }
        } catch (error) {
            console.error("❌ AJAX Profile Update Error:", error);
            showMessage("Network error. Please try again.", "error");
        }
    });

    // AJAX Password Change
    passwordForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!validateCurrentPassword() || !validateNewPassword() || !validateConfirmPassword()) return;

        const formData = new FormData(passwordForm);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch("/user/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });

            const result = await response.json();
            messageContainer.innerHTML = "";

            if (response.ok) {
                showMessage(result.message, "success");
                passwordForm.reset();
            } else {
                showMessage(result.error || "An error occurred.", "error");
            }
        } catch (error) {
            console.error("❌ AJAX Password Change Error:", error);
            showMessage("Network error. Please try again.", "error");
        }
    });

    // Show Message Helper
    function showMessage(text, type) {
        const div = document.createElement("div");
        div.className = `p-4 rounded-md text-center font-medium ${
            type === "success" ? "bg-[var(--color-green-100)] text-[var(--color-green-500)]" : "bg-[var(--color-red-100)] text-[var(--color-red-500)]"
        }`;
        div.textContent = text;
        messageContainer.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
});