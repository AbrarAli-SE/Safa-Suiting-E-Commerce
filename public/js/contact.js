
  document.addEventListener("DOMContentLoaded", function () {
    // Hide success/error messages after 5 seconds with fade-out animation
    setTimeout(function () {
      const messages = document.querySelectorAll(".text-center.font-medium.mb-6");
      messages.forEach((message) => {
        message.classList.add("opacity-0");
        setTimeout(() => message.style.display = "none", 500); // Match fade-out duration
      });
    }, 5000);

    // Form Validation
    const form = document.getElementById("contactForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const messageInput = document.getElementById("message");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");
    const messageError = document.getElementById("messageError");

    function validateName() {
      const value = nameInput.value.trim();
      if (value === "") {
        nameError.textContent = "";
        nameError.classList.add("hidden");
      } else if (value.length < 3) {
        nameError.textContent = "Name must be at least 3 characters long.";
        nameError.classList.remove("hidden");
      } else {
        nameError.classList.add("hidden");
      }
    }

    function validateEmail() {
      const value = emailInput.value.trim();
      const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (value === "") {
        emailError.textContent = "";
        emailError.classList.add("hidden");
      } else if (!gmailPattern.test(value)) {
        emailError.textContent = "Enter a valid Gmail address.";
        emailError.classList.remove("hidden");
      } else {
        emailError.classList.add("hidden");
      }
    }

    function validatePhone() {
      const value = phoneInput.value.trim();
      const phonePattern = /^[0-9]{11}$/;
      if (value === "") {
        phoneError.textContent = "";
        phoneError.classList.add("hidden");
      } else if (!phonePattern.test(value)) {
        phoneError.textContent = "Enter a valid 11-digit phone number.";
        phoneError.classList.remove("hidden");
      } else {
        phoneError.classList.add("hidden");
      }
    }

    function validateMessage() {
      const value = messageInput.value.trim();
      if (value === "") {
        messageError.textContent = "";
        messageError.classList.add("hidden");
      } else if (value.length < 10) {
        messageError.textContent = "Message must be at least 10 characters.";
        messageError.classList.remove("hidden");
      } else {
        messageError.classList.add("hidden");
      }
    }

    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    phoneInput.addEventListener("input", validatePhone);
    messageInput.addEventListener("input", validateMessage);

    form.addEventListener("submit", function (event) {
      validateName();
      validateEmail();
      validatePhone();
      validateMessage();

      if (!nameError.classList.contains("hidden") || 
          !emailError.classList.contains("hidden") || 
          !phoneError.classList.contains("hidden") || 
          !messageError.classList.contains("hidden")) {
        event.preventDefault();
      }
    });
  });
