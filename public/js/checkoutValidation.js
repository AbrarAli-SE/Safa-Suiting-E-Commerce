document.addEventListener("DOMContentLoaded", function () {
    const checkoutForm = document.getElementById('checkoutForm');
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
        case 'phoneNumber':
          return trimmedValue !== '';
        case 'emailAddress':
          return trimmedValue.match(/^\S+@\S+\.\S+$/);
        default:
          return true;
      }
    }
  
    // Live validation
    Object.keys(fields).forEach(fieldId => {
      fields[fieldId].addEventListener('input', function () {
        const value = this.value;
        if (!validateField(fieldId, value)) {
          showError(fieldId, `${fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`);
        } else {
          hideError(fieldId);
        }
      });
    });
  
    // Form submission validation
    checkoutForm.addEventListener('submit', function (event) {
      let isValid = true;
  
      Object.keys(fields).forEach(fieldId => {
        const value = fields[fieldId].value;
        if (!validateField(fieldId, value)) {
          showError(fieldId, `${fieldId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required.`);
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