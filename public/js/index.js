// <!-- JavaScript (Updated for Scroll Effect with Root Colors) -->

  window.addEventListener('scroll', function() {
    const header = document.getElementById('mainHeader');
    if (window.scrollY > 50) {
      header.style.backgroundColor = 'var(--color-gray-50)';
      header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.backgroundColor = 'var(--color-white)';
      header.style.boxShadow = 'none';
    }
  });

  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const closeNavBtn = document.getElementById('closeNavBtn');
  const fullScreenNav = document.getElementById('fullScreenNav');

  function openNav() {
    fullScreenNav.classList.add('open');
    fullScreenNav.style.opacity = '1';
    fullScreenNav.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    fullScreenNav.classList.remove('open');
    fullScreenNav.style.opacity = '0';
    fullScreenNav.style.pointerEvents = 'none';
    document.body.style.overflow = 'auto';
  }

  hamburgerBtn.addEventListener('click', openNav);
  closeNavBtn.addEventListener('click', closeNav);

  window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && fullScreenNav.classList.contains('open')) {
      closeNav();
    }
  });

  if (window.innerWidth >= 768 && fullScreenNav.classList.contains('open')) {
    closeNav();
  }





  document.addEventListener("DOMContentLoaded", function () {
const swiper = new Swiper(".default-carousel", {
  loop: true,
  autoplay: { delay: 5000, disableOnInteraction: false },
  navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
  pagination: { el: ".swiper-pagination", clickable: true, bulletClass: "swiper-pagination-bullet", bulletActiveClass: "swiper-pagination-bullet-active" },
  slidesPerView: 1,
  spaceBetween: 0,
  observer: true,
  observeParents: true,
  observeSlideChildren: true
});


const navLinks = document.querySelectorAll('.nav-link');


// Highlight Active Link
const currentPath = window.location.pathname;
navLinks.forEach(link => {
  if (link.getAttribute('href') === currentPath) {
      link.classList.add('text-[var(--color-red-500)]');
      link.classList.remove('text-[var(--color-black)]');
  }
});

});

const swiper = new Swiper('.thumbnail-carousel', {
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});
document.querySelectorAll('.swiper-thumbnail').forEach((thumb, index) => {
  thumb.addEventListener('click', () => swiper.slideTo(index));
});



  // Select all left and right buttons
  const leftButtons = document.querySelectorAll('.left-button');
          const rightButtons = document.querySelectorAll('.right-button');
          const sliders = document.querySelectorAll('.slider-container');

          // Loop through all left and right buttons and add event listeners
          leftButtons.forEach((button, index) => {
            button.addEventListener('click', function () {
              sliders[index].scrollBy({ left: -300, behavior: 'smooth' });
            });
          });

          rightButtons.forEach((button, index) => {
            button.addEventListener('click', function () {
              sliders[index].scrollBy({ left: 300, behavior: 'smooth' });
            });
          });