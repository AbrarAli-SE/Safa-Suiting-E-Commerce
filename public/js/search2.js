document.addEventListener("DOMContentLoaded", function () {
    const quickViewButtons = document.querySelectorAll(".quick-view-btn");
    const modal = document.getElementById("quickViewModal");
    const productName = document.getElementById("modalProductName");
    const productImage = document.getElementById("modalProductImage");
    const productPrice = document.getElementById("modalProductPrice");
    const productOldPrice = document.getElementById("modalProductOldPrice");
    const productDesc = document.getElementById("modalProductDesc");
  
    quickViewButtons.forEach(button => {
      button.addEventListener("click", function () {
        productName.textContent = this.getAttribute("data-name");
        productImage.src = this.getAttribute("data-image");
        productPrice.textContent = `Rs ${this.getAttribute("data-price")}`;
        productOldPrice.textContent = this.getAttribute("data-discountprice") > 0 ? `Rs ${this.getAttribute("data-discountprice")}` : '';
        productDesc.textContent = this.getAttribute("data-description");
  
        modal.classList.remove("opacity-0", "pointer-events-none");
        modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-95');
        modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-100');
        document.body.style.overflow = 'hidden';
      });
    });
  });
  
  function closeQuickView() {
    const modal = document.getElementById("quickViewModal");
    modal.classList.remove("opacity-100", "pointer-events-auto");
    modal.classList.add("opacity-0", "pointer-events-none");
    modal.querySelector('.bg-[var(--color-white)]').classList.remove('scale-100');
    modal.querySelector('.bg-[var(--color-white)]').classList.add('scale-95');
    document.body.style.overflow = 'auto';
  }