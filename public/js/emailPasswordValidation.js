// Email and password validation for Login, Register, and Forgot Password
document.addEventListener("DOMContentLoaded", function () {
    const forms = {
      login: document.getElementById("loginForm"),
      signup: document.getElementById("signupForm"),
      forgot: document.getElementById("forgotForm"),
    };
  
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
  
    if (!emailInput) return; // Exit if no email input (e.g., OTP page)
  
    function validateEmail() {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      const emailValue = emailInput.value.trim();
  
      if (emailValue.length === 0) {
        emailError.classList.add("hidden");
        return false;
      }
      if (!emailPattern.test(emailValue)) {
        emailError.textContent = "Enter a valid Gmail address.";
        emailError.classList.remove("hidden");
        return false;
      }
      emailError.classList.add("hidden");
      return true;
    }
  
    function validatePassword() {
      if (!passwordInput) return true; // Skip if no password field (e.g., Forgot Password)
      const passwordValue = passwordInput.value.trim();
  
      if (passwordValue.length === 0) {
        passwordError.classList.add("hidden");
        return false;
      }
      if (passwordValue.length < 6) {
        passwordError.textContent = "Password must be at least 6 characters long.";
        passwordError.classList.remove("hidden");
        return false;
      }
      passwordError.classList.add("hidden");
      return true;
    }
  
    emailInput.addEventListener("input", validateEmail);
    if (passwordInput) passwordInput.addEventListener("input", validatePassword);
  
    // Form submission validation
    const activeForm = forms.login || forms.signup || forms.forgot;
    if (activeForm) {
      activeForm.addEventListener("submit", function (event) {
        const isEmailValid = validateEmail();
        const isPasswordValid = passwordInput ? validatePassword() : true;
  
        if (!isEmailValid || !isPasswordValid) {
          event.preventDefault();
        }
      });
    }
  });