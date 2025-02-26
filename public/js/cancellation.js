document.addEventListener("DOMContentLoaded", function () {
    const viewButtons = document.querySelectorAll(".view-btn");
    const modal = document.getElementById("productModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const closeModal = document.getElementById("closeModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
  
    // Dynamic cancellation data from the server (assumed to be passed via EJS)
    const cancellations = [
      <% cancellations.forEach(cancellation => { %>
        {
          id: "<%= cancellation._id %>",
          name: "<%= cancellation.product.name %>",
          category: "<%= cancellation.product.category %>",
          quantity: <%= cancellation.quantity || 1 %>,
          price: "Rs <%= cancellation.price %>",
          description: "<%= cancellation.product.description || 'No description available.' %>",
          image: "<%= cancellation.product.image %>"
        },
      <% }) %>
    ];
  
    function openModal(productId) {
      const cancellation = cancellations.find(c => c.id === productId);
      if (cancellation) {
        modalTitle.textContent = cancellation.name;
        modalContent.innerHTML = `
          <div class="flex gap-4">
            <img src="${cancellation.image}" alt="${cancellation.name}" class="w-32 h-32 object-cover rounded">
            <div>
              <p><strong>Category:</strong> ${cancellation.category}</p>
              <p><strong>Quantity:</strong> ${cancellation.quantity}</p>
              <p><strong>Price:</strong> ${cancellation.price}</p>
              <p><strong>Description:</strong> ${cancellation.description}</p>
            </div>
          </div>
        `;
  
        modal.classList.remove("opacity-0", "pointer-events-none");
        modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-95');
        modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-100');
        document.body.style.overflow = 'hidden';
      }
    }
  
    function closeModalFunction() {
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-100');
      modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-95');
      document.body.style.overflow = 'auto';
    }
  
    closeModalBtn.addEventListener("click", closeModalFunction);
    closeModal.addEventListener("click", closeModalFunction);
  
    viewButtons.forEach(button => {
      button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior
        const productId = this.getAttribute("data-product-id");
        openModal(productId);
      });
    });
  });