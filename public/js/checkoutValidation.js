// checkoutValidation.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkoutForm');
    const fields = [
        {
            id: 'firstName',
            errorId: 'firstNameError',
            validate: (value) => value.trim().length >= 2,
            message: 'First name must be at least 2 characters long'
        },
        {
            id: 'streetAddress',
            errorId: 'streetAddressError',
            validate: (value) => value.trim().length >= 5,
            message: 'Street address must be at least 5 characters long'
        },
        {
            id: 'apartment',
            errorId: 'apartmentError',
            validate: (value) => true, // Optional field, always valid
            message: ''
        },
        {
            id: 'townCity',
            errorId: 'townCityError',
            validate: (value) => value.trim().length >= 2,
            message: 'Town/City must be at least 2 characters long'
        },
        {
            id: 'phoneNumber',
            errorId: 'phoneNumberError',
            validate: (value) => /^\d{11}$/.test(value.replace(/\D/g, '')),
            message: 'Please enter a valid 10-digit phone number'
        },
        {
            id: 'emailAddress',
            errorId: 'emailAddressError',
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        }
    ];

    // Function to validate a single field
    const validateField = (field, input) => {
        const value = input.value;
        const errorElement = document.getElementById(field.errorId);
        
        // Don't show error if field is empty
        if (!value.trim()) {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
            input.classList.remove('border-[var(--color-red-500)]');
            return true;
        }

        // Validate non-empty field
        const isValid = field.validate(value);
        if (!isValid) {
            errorElement.textContent = field.message;
            errorElement.classList.remove('hidden');
            input.classList.add('border-[var(--color-red-500)]');
        } else {
            errorElement.classList.add('hidden');
            errorElement.textContent = '';
            input.classList.remove('border-[var(--color-red-500)]');
        }
        return isValid;
    };

    // Add event listeners for real-time validation
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            input.addEventListener('input', () => {
                validateField(field, input);
            });

            // Also validate on blur
            input.addEventListener('blur', () => {
                validateField(field, input);
            });
        }
    });

    // Form submission handler
    form.addEventListener('submit', (e) => {
        let isValid = true;
        
        // Check all required fields
        fields.forEach(field => {
            const input = document.getElementById(field.id);
            // Skip validation for optional fields (apartment)
            if (field.id === 'apartment') return;

            if (!validateField(field, input)) {
                isValid = false;
            }
            
            // Additional check for empty required fields
            if (!input.value.trim() && field.id !== 'apartment') {
                const errorElement = document.getElementById(field.errorId);
                errorElement.textContent = 'This field is required';
                errorElement.classList.remove('hidden');
                input.classList.add('border-[var(--color-red-500)]');
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
        }
    });
});