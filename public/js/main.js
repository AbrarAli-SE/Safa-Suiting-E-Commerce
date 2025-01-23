// const slider = document.getElementById("slider");
  // const slides = [];
  // const contexts = [];
  // let currentIndex = 0;

  // // Function to preview images and add them to the slider
  // function previewImage(event, index) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       if (slides[index]) {
  //         slides[index].src = e.target.result;
  //       } else {
  //         const img = document.createElement("img");
  //         img.src = e.target.result;
  //         img.alt = `Image ${index + 1}`;
  //         img.className =
  //           "slider-item w-80 h-60 rounded-lg shadow-lg transform scale-75 transition-transform duration-300";
  //         const textContainer = document.createElement("div");
  //         textContainer.className = "absolute text-center text-white w-80";
  //         const boldText = document.createElement("p");
  //         boldText.className = "font-bold text-lg mb-2";
  //         const normalText = document.createElement("p");
  //         normalText.className = "text-sm";
  //         textContainer.appendChild(boldText);
  //         textContainer.appendChild(normalText);
  //         const wrapper = document.createElement("div");
  //         wrapper.className = "relative";
  //         wrapper.appendChild(img);
  //         wrapper.appendChild(textContainer);
  //         slider.appendChild(wrapper);
  //         slides[index] = wrapper;
  //         contexts[index] = { bold: "", normal: "" };
  //       }
  //       updateStackSlider();
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  // // Function to update the text content of the images
  // function updateContext(index, type, value) {
  //   contexts[index][type] = value;
  //   if (slides[index]) {
  //     const [boldText, normalText] = slides[index].querySelectorAll("p");
  //     boldText.textContent = contexts[index].bold;
  //     normalText.textContent = contexts[index].normal;
  //   }
  // }

  // function uploadSlider() {
  //   const formData = new FormData(document.getElementById("carousel-form"));
  //   const sliderData = contexts.map((context, i) => ({
  //     image: formData.get(`image${i + 1}`),
  //     boldText: context.bold,
  //     normalText: context.normal,
  //   }));
  //   console.log("Slider Data:", sliderData);
  //   alert("Slider uploaded successfully!");
  // }

  // // Function to update the slider
  // function updateStackSlider() {
  //   slides.forEach((slide, index) => {
  //     const offset = index - currentIndex;
  //     slide.style.transform = `translateX(${offset * 100}%) scale(${index === currentIndex ? 1 : 0.75
  //       })`;
  //     slide.style.opacity = index === currentIndex ? 1 : 0.5;
  //     slide.style.zIndex = index === currentIndex ? 10 : 1;
  //   });
  // }

  // function prevSlide() {
  //   currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  //   updateStackSlider();
  // }

  // function nextSlide() {
  //   currentIndex = (currentIndex + 1) % slides.length;
  //   updateStackSlider();
  // }