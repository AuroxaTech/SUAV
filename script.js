document.addEventListener("DOMContentLoaded", function () {
  const visionSlides = document.querySelectorAll(".vision-slide");
  const workImages = document.querySelectorAll(".work-img");
  const ourWorkSection = document.querySelector(".our-work");
  const loaderVideo = document.querySelector(".loader-video");

  let isWorkSectionVisible = false;
  let visionAnimationDone = false;
  let currentVisionSlide = 0;
  let visionSlidesComplete = false;
  let scrollingEnabled = false;

  console.log("Script initialized", {
    visionSlides: visionSlides.length,
    scrollingEnabled: scrollingEnabled,
  });

  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: false,
    mirror: true,
  });

  // Make sure all vision slides are hidden initially
  visionSlides.forEach((slide, index) => {
    slide.classList.remove("active");
    console.log(`Vision slide ${index} initialized`);
  });

  // Loader animation - wait for video to end
  if (loaderVideo) {
    loaderVideo.addEventListener("ended", function () {
      document.body.classList.add("loaded");
      // Show first vision slide with animation after loader completes
      showVisionWithAnimation();
    });

    // Fallback in case video doesn't load or has issues
    setTimeout(function () {
      if (!document.body.classList.contains("loaded")) {
        document.body.classList.add("loaded");
        showVisionWithAnimation();
      }
    }, 5000);
  } else {
    // If video element doesn't exist, use the timeout
    setTimeout(function () {
      document.body.classList.add("loaded");
      showVisionWithAnimation();
    }, 2000);
  }

  // Function to show vision with animation
  function showVisionWithAnimation() {
    if (visionAnimationDone) return; // Prevent multiple animations

    console.log("Showing first vision slide");

    // Add a small delay to ensure hero section is visible first
    setTimeout(() => {
      if (visionSlides.length > 0) {
        // Add the active class to make it visible
        visionSlides[0].classList.add("active");
        currentVisionSlide = 0;

        // Mark animation as done
        visionAnimationDone = true;

        // Enable scroll handling after first slide is shown
        setTimeout(() => {
          scrollingEnabled = true;
          console.log("Scrolling enabled:", scrollingEnabled);
        }, 1000);
      }
    }, 500);
  }

  // Function to show next vision slide
  function showNextVisionSlide() {
    console.log("Attempting to show next slide, current:", currentVisionSlide);

    // If we're already at the last slide
    if (currentVisionSlide >= visionSlides.length - 1) {
      visionSlidesComplete = true;
      console.log("All vision slides complete");
      return false; // No more slides to show
    }

    // Temporarily disable scrolling to prevent multiple rapid transitions
    scrollingEnabled = false;

    // Hide current slide
    visionSlides[currentVisionSlide].classList.remove("active");

    // Show next slide
    currentVisionSlide++;
    visionSlides[currentVisionSlide].classList.add("active");

    console.log("Showed slide:", currentVisionSlide);

    // Re-enable scrolling after a delay
    setTimeout(() => {
      scrollingEnabled = true;
      console.log("Scrolling re-enabled after transition");
    }, 1000); // 1 second cooldown between slide transitions

    return true; // Successfully showed next slide
  }

  // Function to animate work images with flip effect
  function animateWorkImages() {
    // Reset all images first
    workImages.forEach((img) => {
      img.classList.remove("flip-in");
    });

    // Trigger reflow to ensure animations restart
    void ourWorkSection.offsetWidth;

    // Add animation with delay
    workImages.forEach((img, index) => {
      setTimeout(() => {
        img.classList.add("flip-in");
      }, index * 200); // Stagger the animations
    });
  }

  // Check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <=
        (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  }

  // Simplified wheel event handler
  window.addEventListener(
    "wheel",
    function (e) {
      if (!scrollingEnabled) return;

      if (!visionSlidesComplete && e.deltaY > 0) {
        e.preventDefault();
        showNextVisionSlide();
      }
    },
    { passive: false }
  );

  // Prevent default scrolling while showing slides
  window.addEventListener("scroll", function () {
    if (!visionSlidesComplete) {
      window.scrollTo(0, 0);
    }
  });

  // Check for animations on scroll - only for work section
  window.addEventListener(
    "scroll",
    debounce(function () {
      console.log("Scroll event for work section");
      // Check if work section is in viewport
      const workSectionVisible = isInViewport(ourWorkSection);

      // If section visibility changed from invisible to visible
      if (workSectionVisible && !isWorkSectionVisible) {
        animateWorkImages();
      }

      // Update section visibility state
      isWorkSectionVisible = workSectionVisible;
    }, 50)
  );

  // Debounce function to limit scroll events
  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  console.log("Script setup complete");

  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");

  // Check for saved theme preference or respect OS preference
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("theme");

  // If the user has explicitly chosen a theme, use it
  if (savedTheme === "dark") {
    document.body.classList.add("darkTheme");
  } else if (savedTheme === "light") {
    document.body.classList.remove("darkTheme");
  } else {
    // Otherwise, respect OS preference
    if (prefersDarkScheme.matches) {
      document.body.classList.add("darkTheme");
    }
  }

  // Update button appearance based on current theme
  updateThemeToggle();

  // Add click event to toggle theme
  themeToggle.addEventListener("click", function () {
    // Toggle darkTheme class on body
    document.body.classList.toggle("darkTheme");

    // Save user preference
    if (document.body.classList.contains("darkTheme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }

    // Update button appearance
    updateThemeToggle();
  });

  // Function to update toggle button appearance
  function updateThemeToggle() {
    const isDark = document.body.classList.contains("darkTheme");
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");
    const logoImg = document.querySelector(".logo a img");

    // Update icon visibility based on current theme
    sunIcon.style.display = isDark ? "none" : "block";
    moonIcon.style.display = isDark ? "block" : "none";
    
    // Update logo image based on theme
    if (logoImg) {
      logoImg.src = isDark ? "img/SUAV LOGO2.png" : "img/SUAV LOGO.png";
    }
  }
});
