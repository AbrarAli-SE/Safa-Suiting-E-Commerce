

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
  // Initialize Swiper with fade effect
const swiper = new Swiper('.thumbnail-carousel', {
    // Core settings
    effect: 'creative', // Set fade transition effect
    speed: 1000,    // Transition duration in milliseconds (1 second for slow motion)
    loop: true,     // Enable continuous loop
    autoplay: {
        delay: 2000, // Time between transitions (5 seconds)
        // disableOnInteraction: true, // Continue autoplay after user interaction
    },
    
    creativeEffect: {
  prev: { translate: [0, 0, -400] },
  next: { translate: ['100%', 0, 0] }
}
    
    
});

// Thumbnail click handler
document.querySelectorAll('.swiper-thumbnail').forEach((thumbnail, index) => {
    thumbnail.addEventListener('click', () => {
        swiper.slideTo(index); // Go to clicked thumbnail's slide
    });
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