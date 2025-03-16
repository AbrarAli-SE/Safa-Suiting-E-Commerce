// public/js/editProduct.js
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("product-form");
    const submitBtn = document.getElementById("submit-btn");
    const messageContainer = document.getElementById("message-container");
    const imageInput = document.getElementById("image");
    const imagePreview = document.getElementById("image-preview");
    const previewText = document.getElementById("preview-text");
  
    // Get product ID from the form's data attribute
    const productId = form.dataset.productId;
  
    // Validation Elements
    const inputs = {
      brand: document.getElementById("brand"),
      name: document.getElementById("name"),
      price: document.getElementById("price"),
      description: document.getElementById("description"),
      quantity: document.getElementById("quantity"),
      discountPrice: document.getElementById("discountPrice"),
      keywords: document.getElementById("keywords"),
      image: imageInput,
    };
  
    const errors = {
      brand: document.getElementById("brandError"),
      name: document.getElementById("nameError"),
      price: document.getElementById("priceError"),
      description: document.getElementById("descriptionError"),
      quantity: document.getElementById("quantityError"),
      discountPrice: document.getElementById("discountError"),
      keywords: document.getElementById("keywordsError"),
      image: document.getElementById("imageError"),
    };
  
    // Image Preview
    imageInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.classList.remove("hidden");
          if (previewText) previewText.classList.add("hidden");
        };
        reader.readAsDataURL(file);
      }
      validateImage();
    });
  
    // Validation Functions
    function validateBrand() {
      const value = inputs.brand.value.trim();
      if (value.length === 0) {
        errors.brand.classList.add("hidden");
        return true; // Allow empty during input, check on submit
      }
      if (value.length < 2) {
        errors.brand.textContent = "Brand must be at least 2 characters.";
        errors.brand.classList.remove("hidden");
        return false;
      }
      errors.brand.classList.add("hidden");
      return true;
    }
  
    function validateName() {
      const value = inputs.name.value.trim();
      if (value.length === 0) {
        errors.name.classList.add("hidden");
        return true; // Allow empty during input, check on submit
      }
      if (value.length < 3) {
        errors.name.textContent = "Name must be at least 3 characters.";
        errors.name.classList.remove("hidden");
        return false;
      }
      errors.name.classList.add("hidden");
      return true;
    }
  
    function validatePrice() {
      const value = inputs.price.value.trim();
      if (value.length === 0) {
        errors.price.classList.add("hidden");
        return true; // Allow empty during input, check on submit
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        errors.price.textContent = "Price must be a positive number.";
        errors.price.classList.remove("hidden");
        return false;
      }
      errors.price.classList.add("hidden");
      return true;
    }
  
    function validateDescription() {
      const value = inputs.description.value.trim();
      if (value.length === 0) {
        errors.description.classList.add("hidden");
        return true; // Allow empty during input, check on submit
      }
      if (value.length < 10) {
        errors.description.textContent = "Description must be at least 10 characters.";
        errors.description.classList.remove("hidden");
        return false;
      }
      errors.description.classList.add("hidden");
      return true;
    }
  
    function validateQuantity() {
      const value = inputs.quantity.value.trim();
      if (value.length === 0) {
        errors.quantity.classList.add("hidden");
        return true; // Allow empty during input, check on submit
      }
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        errors.quantity.textContent = "Quantity must be a non-negative number.";
        errors.quantity.classList.remove("hidden");
        return false;
      }
      errors.quantity.classList.add("hidden");
      return true;
    }
  
    function validateDiscountPrice() {
      const value = inputs.discountPrice.value.trim();
      if (value.length === 0) {
        errors.discountPrice.classList.add("hidden");
        return true; // Optional field
      }
      const numValue = parseFloat(value);
      const priceValue = parseFloat(inputs.price.value);
      if (isNaN(numValue) || numValue < 0) {
        errors.discountPrice.textContent = "Discount price must be non-negative.";
        errors.discountPrice.classList.remove("hidden");
        return false;
      }
      if (!isNaN(priceValue) && numValue >= priceValue) {
        errors.discountPrice.textContent = "Discount price must be less than regular price.";
        errors.discountPrice.classList.remove("hidden");
        return false;
      }
      errors.discountPrice.classList.add("hidden");
      return true;
    }
  
    function validateKeywords() {
      const value = inputs.keywords.value.trim();
      if (value.length === 0) {
        errors.keywords.classList.add("hidden");
        return true; // Optional field
      }
      if (value.split(",").length < 1) {
        errors.keywords.textContent = "Enter at least one keyword.";
        errors.keywords.classList.remove("hidden");
        return false;
      }
      errors.keywords.classList.add("hidden");
      return true;
    }
  
    function validateImage() {
      const files = inputs.image.files;
      if (files.length === 0) {
        errors.image.classList.add("hidden");
        return true; // Image is optional on update
      }
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        errors.image.textContent = "Please upload a valid image file.";
        errors.image.classList.remove("hidden");
        return false;
      }
      errors.image.classList.add("hidden");
      return true;
    }
  
    // Add live validation listeners
    Object.keys(inputs).forEach((key) => {
      if (inputs[key]) {
        inputs[key].addEventListener("input", () => {
          switch (key) {
            case "brand": validateBrand(); break;
            case "name": validateName(); break;
            case "price": validatePrice(); break;
            case "description": validateDescription(); break;
            case "quantity": validateQuantity(); break;
            case "discountPrice": validateDiscountPrice(); break;
            case "keywords": validateKeywords(); break;
            case "image": validateImage(); break;
          }
        });
      }
    });
  
    // Form Submission
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      // Final validation before submission
      const isValid = [
        validateBrand(),
        validateName(),
        validatePrice(),
        validateDescription(),
        validateQuantity(),
        validateDiscountPrice(),
        validateKeywords(),
        validateImage(),
      ].every(Boolean);
  
      // Check required fields are not empty
      const requiredFields = ["brand", "name", "price", "description", "quantity"];
      let allFilled = true;
      requiredFields.forEach((field) => {
        const value = inputs[field].value.trim();
        if (value.length === 0) {
          errors[field].textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
          errors[field].classList.remove("hidden");
          allFilled = false;
        }
      });
  
      if (!isValid || !allFilled) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Product";
        return;
      }
  
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";
  
      const formData = new FormData(form);
  
      try {
        const response = await fetch(`/admin/product/update/${productId}`, {
          method: "PUT",
          body: formData,
        });
  
        const result = await response.json();
        messageContainer.innerHTML = "";
  
        if (response.ok) {
          showMessage(result.message, "success");
          setTimeout(() => {
            window.location.href = `/admin/product/product-list`;
          }, 2000);
        } else {
          showMessage(result.error || "An error occurred.", "error");
        }
      } catch (error) {
        console.error("❌ AJAX Error:", error);
        showMessage("Network error. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Product";
      }
    });
  
    // Show Message
    function showMessage(text, type) {
      const div = document.createElement("div");
      div.className = `bg-[var(--color-${type === "success" ? "green" : "red"}-100)] text-[var(--color-${type === "success" ? "green" : "red"}-700)] border border-[var(--color-${type === "success" ? "green" : "red"}-400)] p-3 rounded-lg`;
      div.textContent = text;
      messageContainer.appendChild(div);
      setTimeout(() => div.remove(), 5000);
    }
  });