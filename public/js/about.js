
  document.addEventListener("DOMContentLoaded", function () {
    function startCounter(element) {
      let target = +element.getAttribute("data-target");
      let count = 0;
      let speed = Math.floor(target / 150);

      function updateCount() {
        if (count < target) {
          count += speed;
          element.textContent = count.toLocaleString();
          requestAnimationFrame(updateCount);
        } else {
          element.textContent = target.toLocaleString();
        }
      }

      updateCount();
    }

    function isElementInViewport(el) {
      let rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom >= 0;
    }

    function checkAndStartCounters() {
      let counters = document.querySelectorAll(".counter");
      counters.forEach((counter) => {
        if (isElementInViewport(counter) && !counter.classList.contains("started")) {
          counter.classList.add("started");
          startCounter(counter);
        }
      });
    }

    window.addEventListener("scroll", checkAndStartCounters);
    checkAndStartCounters();
  });
