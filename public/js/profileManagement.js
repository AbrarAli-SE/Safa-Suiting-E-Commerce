// public/js/profileManagement.js
document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('message-container');
    let isSubmitting = false; // Prevent multiple submissions
  
    // Show Message Helper
    function showMessage(text, type) {
      if (!messageContainer) return; // Ensure container exists
      messageContainer.innerHTML = ''; // Clear previous messages
      const div = document.createElement('div');
      div.className = `p-4 rounded-md text-center font-medium ${
        type === 'success' 
          ? 'bg-[var(--color-green-100)] text-[var(--color-green-500)]' 
          : 'bg-[var(--color-red-100)] text-[var(--color-red-500)]'
      }`;
      div.textContent = text;
      messageContainer.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  
    // Shipping & Tax Form
    const shippingOption = document.getElementById('shippingOption');
    const shippingRateField = document.getElementById('shippingRateField');
    const shippingRateInput = document.getElementById('shippingRate');
    const shippingTaxForm = document.getElementById('shippingTaxForm');
  
    if (shippingOption && shippingRateField && shippingRateInput) {
      shippingOption.addEventListener('change', (e) => {
        shippingRateField.classList.toggle('hidden', e.target.value !== 'rate');
        shippingRateInput.toggleAttribute('required', e.target.value === 'rate');
      });
    }
  
    shippingTaxForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
  
      const shippingOptionValue = shippingOption.value;
      const shippingRate = shippingOptionValue === 'rate' ? shippingRateInput.value : 0;
      const taxRate = document.getElementById('taxRate').value;
  
      try {
        if (!shippingOptionValue) throw new Error('Please select a shipping option.');
        if (shippingOptionValue === 'rate' && (!shippingRate || shippingRate === '')) 
          throw new Error('Please enter a shipping rate for fixed rate shipping.');
        if (shippingOptionValue === 'rate' && parseFloat(shippingRate) < 0) 
          throw new Error('Shipping rate cannot be negative.');
        if (!taxRate || taxRate === '') throw new Error('Please enter a tax rate.');
        if (parseFloat(taxRate) < 0) throw new Error('Tax rate cannot be negative.');
  
        const data = {
          shippingOption: shippingOptionValue,
          shippingRate: shippingOptionValue === 'rate' ? parseFloat(shippingRate) : 0,
          taxRate: parseFloat(taxRate)
        };
  
        const response = await fetch('/admin/update-shipping-tax', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include'
        });
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to update settings.');
  
        showMessage(result.message || 'Shipping and tax settings updated successfully.', 'success');
        shippingOption.value = result.shippingSettings.shippingOption;
        shippingRateInput.value = result.shippingSettings.shippingRate;
        document.getElementById('taxRate').value = result.shippingSettings.taxRate;
        shippingRateField.classList.toggle('hidden', result.shippingSettings.shippingOption !== 'rate');
        shippingRateInput.toggleAttribute('required', result.shippingSettings.shippingOption === 'rate');
      } catch (error) {
        console.error('❌ Shipping/Tax Error:', error);
        showMessage(error.message || 'Network error. Please try again.', 'error');
      } finally {
        isSubmitting = false;
      }
    });
  
    // Profile Form
    const profileForm = document.getElementById('profileForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const welcomeMessage = document.getElementById('welcome-message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
  
    function validateName() {
      const nameValue = nameInput.value.trim();
      if (nameValue.length === 0) {
        nameError.classList.add('hidden');
        return false;
      }
      if (nameValue.length < 3) {
        nameError.textContent = 'Name must be at least 3 characters long.';
        nameError.classList.remove('hidden');
        return false;
      }
      nameError.classList.add('hidden');
      return true;
    }
  
    function validateEmail() {
      const emailValue = emailInput.value.trim();
      const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (emailValue.length === 0) {
        emailError.classList.add('hidden');
        return false;
      }
      if (!emailPattern.test(emailValue)) {
        emailError.textContent = 'Enter a valid Gmail address.';
        emailError.classList.remove('hidden');
        return false;
      }
      emailError.classList.add('hidden');
      return true;
    }
  
    if (nameInput) nameInput.addEventListener('input', validateName);
    if (emailInput) emailInput.addEventListener('input', validateEmail);
  
    profileForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting || !validateName() || !validateEmail()) return;
      isSubmitting = true;
  
      const formData = new FormData(profileForm);
      const data = Object.fromEntries(formData);
  
      try {
        const response = await fetch('/admin/update-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'An error occurred.');
  
        showMessage(result.message || 'Profile updated successfully.', 'success');
        nameInput.value = result.user.name;
        emailInput.value = result.user.email;
        if (welcomeMessage) welcomeMessage.textContent = result.user.name;
      } catch (error) {
        console.error('❌ Profile Update Error:', error);
        showMessage(error.message || 'Network error. Please try again.', 'error');
      } finally {
        isSubmitting = false;
      }
    });
  
    // Password Form
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
  
    function validateCurrentPassword() {
      const value = currentPassword.value.trim();
      if (value.length === 0) {
        currentPasswordError.classList.add('hidden');
        return false;
      }
      currentPasswordError.classList.add('hidden');
      return true;
    }
  
    function validateNewPassword() {
      const value = newPassword.value.trim();
      if (value.length === 0) {
        newPasswordError.classList.add('hidden');
        return false;
      }
      if (value.length < 6) {
        newPasswordError.textContent = 'Password must be at least 6 characters long.';
        newPasswordError.classList.remove('hidden');
        return false;
      }
      newPasswordError.classList.add('hidden');
      return true;
    }
  
    function validateConfirmPassword() {
      const value = confirmPassword.value.trim();
      if (value.length === 0) {
        confirmPasswordError.classList.add('hidden');
        return false;
      }
      if (value !== newPassword.value) {
        confirmPasswordError.textContent = 'Passwords do not match.';
        confirmPasswordError.classList.remove('hidden');
        return false;
      }
      confirmPasswordError.classList.add('hidden');
      return true;
    }
  
    if (currentPassword) currentPassword.addEventListener('input', validateCurrentPassword);
    if (newPassword) newPassword.addEventListener('input', validateNewPassword);
    if (confirmPassword) confirmPassword.addEventListener('input', validateConfirmPassword);
  
    passwordForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting || !validateCurrentPassword() || !validateNewPassword() || !validateConfirmPassword()) return;
      isSubmitting = true;
  
      const formData = new FormData(passwordForm);
      const data = Object.fromEntries(formData);
  
      try {
        const response = await fetch('/admin/change-password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'An error occurred.');
  
        showMessage(result.message || 'Password changed successfully.', 'success');
        passwordForm.reset();
      } catch (error) {
        console.error('❌ Password Change Error:', error);
        showMessage(error.message || 'Network error. Please try again.', 'error');
      } finally {
        isSubmitting = false;
      }
    });
  
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    const phoneNumber = document.getElementById('phoneNumber');
    const customerEmail = document.getElementById('customerEmail');
    const supportEmail = document.getElementById('supportEmail');
    const aboutUs = document.getElementById('aboutUs');
    const city = document.getElementById('city');
  
    contactForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;
  
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
  
      try {
        const response = await fetch('/admin/update-contact', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: 'include',
        });
  
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'An error occurred.');
  
        showMessage(result.message || 'Contact info updated successfully.', 'success');
        
        // Check if contactInfo exists before updating fields
        if (result.contactInfo && typeof result.contactInfo === 'object') {
          phoneNumber.value = result.contactInfo.phoneNumber || '';
          customerEmail.value = result.contactInfo.customerEmail || '';
          supportEmail.value = result.contactInfo.supportEmail || '';
          aboutUs.value = result.contactInfo.aboutUs || '';
          city.value = result.contactInfo.city || '';
        } else {
          console.warn('Contact info not found in response:', result);
          showMessage('Contact info updated, but response data is incomplete.', 'error');
        }
      } catch (error) {
        console.error('❌ Contact Update Error:', error);
        showMessage(error.message || 'Network error. Please try again.', 'error');
      } finally {
        isSubmitting = false;
      }
    });
  });