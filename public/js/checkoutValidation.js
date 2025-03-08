document.addEventListener("DOMContentLoaded", () => {
  const checkoutForm = document.getElementById('checkoutForm');
  if (!checkoutForm) return console.warn("Checkout form not found.");

  const fields = {
      firstName: document.getElementById('firstName'),
      streetAddress: document.getElementById('streetAddress'),
      townCity: document.getElementById('townCity'),
      phoneNumber: document.getElementById('phoneNumber'),
      emailAddress: document.getElementById('emailAddress')
  };

  function showError(fieldId, message) {
      const errorField = document.getElementById(`${fieldId}Error`);
      errorField.textContent = message;
      errorField.classList.remove('hidden');
  }

  function hideError(fieldId) {
      document.getElementById(`${fieldId}Error`).classList.add('hidden');
  }

  function validateField(fieldId, value) {
      const trimmedValue = value.trim();
      switch (fieldId) {
          case 'firstName':
          case 'streetAddress':
          case 'townCity':
              return trimmedValue.length > 0;
          case 'phoneNumber':
              return trimmedValue.match(/^\d{10,}$/); // At least 10 digits
          case 'emailAddress':
              return trimmedValue.match(/^\S+@\S+\.\S+$/); // Basic email validation
          default:
              return true;
      }
  }

  // Live validation on input
  Object.entries(fields).forEach(([fieldId, field]) => {
      field.addEventListener('input', () => {
          const value = field.value;
          if (!validateField(fieldId, value)) {
              showError(fieldId, `${fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is invalid.`);
          } else {
              hideError(fieldId);
          }
      });
  });

  // Form submission validation
  checkoutForm.addEventListener('submit', (event) => {
      let isValid = true;

      Object.entries(fields).forEach(([fieldId, field]) => {
          const value = field.value;
          if (!validateField(fieldId, value)) {
              showError(fieldId, `${fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is invalid.`);
              isValid = false;
          } else {
              hideError(fieldId);
          }
      });

      if (!isValid) {
          event.preventDefault();
      }
  });
});