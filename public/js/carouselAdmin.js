const maxSlides = 3;

function previewImage(event, index) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgPreview = document.getElementById(`preview-${index}`);
      imgPreview.src = e.target.result;
      imgPreview.style.display = 'block';
      console.log("Preview image updated for index", index, "with src:", imgPreview.src); // Debug
    };
    reader.readAsDataURL(file);
  }
  checkUploadButton();
}

function checkUploadButton() {
  const inputs = document.querySelectorAll(".image-upload");
  const uploadBtn = document.getElementById("uploadButton");
  const filledCount = Array.from(inputs).filter(input => input.files.length > 0).length;
  uploadBtn.disabled = filledCount === 0 || filledCount > maxSlides;
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("carousel-form");
  const uploadButton = document.getElementById("uploadButton");
  const messageContainer = document.getElementById("message-container");
  const carouselPreview = document.getElementById("carouselPreview");
  const imageInputs = document.querySelectorAll(".image-upload");

  // Initialize Swiper
  const swiper = new Swiper(".thumbnail-carousel", {
    loop: true,
    autoplay: { delay: 3000, disableOnInteraction: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    pagination: { el: ".swiper-pagination", clickable: true },
    slidesPerView: 1,
    spaceBetween: 0,
    observer: true,
    observeParents: true,
    observeSlideChildren: true
  });

  // Add event listeners for image inputs
  imageInputs.forEach((input, index) => {
    input.addEventListener("change", (event) => previewImage(event, index));
  });

  // Initial button state check
  checkUploadButton();

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    uploadButton.disabled = true;
    uploadButton.textContent = "Updating...";

    const formData = new FormData(form);

    try {
      const response = await fetch("/admin/carousel/upload", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      messageContainer.innerHTML = "";

      if (response.ok) {
        showMessage(result.message, "success");

        // Fetch updated carousel data
        const carouselRes = await fetch("/admin/carousel/get");
        const carouselData = await carouselRes.json();

        // Update preview
        carouselPreview.innerHTML = "";
        if (carouselData.slides.length > 0 && carouselData.slides.length <= maxSlides) {
          carouselData.slides.forEach(slide => {
            const slideHtml = `
              <div class="swiper-slide">
                <div class="relative w-full h-[60vh]">
                  <img src="${slide.image}" class="w-full h-full object-cover" alt="Carousel Slide">
                </div>
              </div>`;
            carouselPreview.insertAdjacentHTML("beforeend", slideHtml);
          });
        } else {
          carouselPreview.innerHTML = `
            <div class="swiper-slide flex justify-center items-center h-[60vh] bg-[var(--color-gray-100)]">
              <p class="text-[var(--color-gray-600)] text-lg">No slides to preview.</p>
            </div>`;
        }

        // Reset form and recreate previews (limit to 3 slides)
        form.reset();
        const slidesContainer = document.getElementById("slides-container");
        slidesContainer.innerHTML = "";
        for (let i = 0; i < maxSlides; i++) {
          const slideHtml = `
            <div class="space-y-4 slide-item bg-[var(--color-gray-50)] p-4 rounded-lg shadow-md" data-index="${i}">
              <label class="block text-lg font-semibold text-[var(--color-black)] mb-2">Slide ${i + 1}</label>
              <input 
                type="file" 
                name="images" 
                class="image-upload w-full p-2 border border-[var(--color-gray-300)] rounded-md bg-[var(--color-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-red-500)] transition-all duration-300" 
                accept="image/*" 
                onchange="previewImage(event, ${i})" />
              <img 
                id="preview-${i}" 
                class="mt-2 rounded-lg shadow-lg w-full h-40 object-cover border-4 border-[var(--color-red-500)]" 
                src="${carouselData.slides[i] && carouselData.slides[i].image ? carouselData.slides[i].image : ''}" 
                alt="Preview ${i + 1}" 
                style="display: ${carouselData.slides[i] && carouselData.slides[i].image ? 'block' : 'none'};">
            </div>`;
          slidesContainer.insertAdjacentHTML("beforeend", slideHtml);
        }

        // Reattach event listeners to new inputs
        const newInputs = document.querySelectorAll(".image-upload");
        newInputs.forEach((input, index) => {
          input.addEventListener("change", (event) => previewImage(event, index));
        });

        checkUploadButton();
        swiper.update();
      } else {
        showMessage(result.error || "An error occurred.", "error");
      }
    } catch (error) {
      console.error("❌ AJAX Error:", error);
      showMessage("Network error. Please try again.", "error");
    } finally {
      uploadButton.disabled = false;
      uploadButton.textContent = "Update Carousel";
    }
  });

  function showMessage(text, type) {
    const div = document.createElement("div");
    div.className = `p-4 rounded-md text-center font-medium ${
      type === "success" ? "bg-[var(--color-green-100)] text-[var(--color-green-500)]" : "bg-[var(--color-red-100)] text-[var(--color-red-500)]"
    }`;
    div.textContent = text;
    messageContainer.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }

  // Thumbnail Click Handling
  const thumbnails = document.getElementsByClassName("swiper-thumbnail");
  Array.from(thumbnails).forEach(thumbnail => {
    thumbnail.addEventListener("click", function () {
      swiper.slideTo(parseInt(this.dataset.slide));
    });
  });
});