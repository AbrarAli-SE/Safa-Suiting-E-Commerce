// General validation for name and OTP
document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const otpForm = document.getElementById("otpForm");
  
    // Name validation (for Register)
    if (signupForm) {
      const nameInput = document.getElementById("name");
      const nameError = document.getElementById("nameError");
  
      function validateName() {
        const nameValue = nameInput.value.trim();
        if (nameValue.length === 0) {
          nameError.classList.add("hidden");
          return false;
        }
        if (nameValue.length < 3) {
          nameError.textContent = "Name must be at least 3 characters long.";
          nameError.classList.remove("hidden");
          return false;
        }
        nameError.classList.add("hidden");
        return true;
      }
  
      nameInput.addEventListener("input", validateName);
      signupForm.addEventListener("submit", function (event) {
        if (!validateName()) {
          event.preventDefault();
        }
      });
    }
  
    // OTP validation (for OTP Verification)
    if (otpForm) {
      const otpInput = document.getElementById("otp");
      const otpError = document.getElementById("otpError");
  
      function validateOTP() {
        const otpValue = otpInput.value.trim();
        if (otpValue.length === 0) {
          otpError.classList.add("hidden");
          return false;
        }
        if (!/^\d{6}$/.test(otpValue)) {
          otpError.textContent = "Enter a valid 6-digit OTP.";
          otpError.classList.remove("hidden");
          return false;
        }
        otpError.classList.add("hidden");
        return true;
      }
  
      otpInput.addEventListener("input", validateOTP);
      otpForm.addEventListener("submit", function (event) {
        if (!validateOTP()) {
          event.preventDefault();
        }
      });
  
      // Resend OTP Logic
      const resendOtpBtn = document.getElementById("resendOtpBtn");
      const timerText = document.getElementById("timerText");
      let countdown = 60;
      let timer;
  
      resendOtpBtn.addEventListener("click", function () {
        resendOtpBtn.disabled = true;
        resendOtpBtn.style.opacity = "0.5";
        timerText.classList.remove("hidden");
  
        timer = setInterval(() => {
          timerText.textContent = `Resend OTP in ${countdown} sec`;
          countdown--;
  
          if (countdown < 0) {
            clearInterval(timer);
            timerText.classList.add("hidden");
            resendOtpBtn.disabled = false;
            resendOtpBtn.style.opacity = "1";
            countdown = 60;
          }
        }, 1000);
  
        fetch("/auth/resend-otp")
          .then(response => response.json())
          .then(data => console.log("OTP Resent:", data))
          .catch(error => console.error("Error:", error));
      });
    }
  });