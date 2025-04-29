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

  // We'll use our own custom animations instead of AOS
  // But still initialize AOS for other elements
  AOS.init({
    duration: 800,
    easing: "ease-out",
    once: true
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

  // Optimized function to show vision with animation
  function showVisionWithAnimation() {
    if (visionAnimationDone) return; // Prevent multiple animations
    
    // Add a smaller delay to ensure hero section is visible first
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
        }, 300); // Reduced from 500
      }
    }, 200); // Reduced from 300
  }

  // Optimized function to show next vision slide
  function showNextVisionSlide() {
    // If we're already at the last slide
    if (currentVisionSlide >= visionSlides.length - 1) {
      visionSlidesComplete = true;
      return false; // No more slides to show
    }

    // Temporarily disable scrolling to prevent multiple rapid transitions
    scrollingEnabled = false;

    // Hide current slide
    visionSlides[currentVisionSlide].classList.remove("active");

    // Show next slide
    currentVisionSlide++;
    visionSlides[currentVisionSlide].classList.add("active");

    // Re-enable scrolling after a shorter delay
    setTimeout(() => {
      scrollingEnabled = true;
    }, 300); // Reduced from 500

    return true; // Successfully showed next slide
  }

  // High-performance animation function with requestAnimationFrame
  function animateWorkImages() {
    // Pre-cache DOM elements for better performance
    const elements = {
      first: document.querySelector('.first-img'),
      second: document.querySelector('.second-img'),
      third: document.querySelector('.third-img'),
      fourth: document.querySelector('.img-right-side')
    };
    
    // Animation sequence with optimal timing
    const animations = [
      { element: elements.first, type: 'custom-flip-left', delay: 0 },
      { element: elements.second, type: 'custom-flip-right', delay: 50 }, // Reduced from 100
      { element: elements.third, type: 'custom-flip-up', delay: 100 }, // Reduced from 200
      { element: elements.fourth, type: 'custom-flip-down', delay: 150 } // Reduced from 300
    ];
    
    // Reset all animations first (in a single frame)
    requestAnimationFrame(() => {
      animations.forEach(item => {
        if (item.element) {
          // Remove animation classes
          item.element.classList.remove(item.type);
          // Ensure element is visible in the DOM but not yet animated
          item.element.style.opacity = '0';
        }
      });
      
      // Force reflow once for all elements
      void document.body.offsetHeight;
      
      // Apply animations with precise timing
      animations.forEach(item => {
        if (item.element) {
          setTimeout(() => {
            requestAnimationFrame(() => {
              item.element.classList.add(item.type);
            });
          }, item.delay);
        }
      });
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

  // Improved scroll handling with better performance
  let lastScrollTime = 0;
  const scrollCooldown = 800; // ms between scroll actions
  
  window.addEventListener("scroll", function() {
    // Only handle scroll events if we're still showing vision slides
    if (!visionSlidesComplete && scrollingEnabled) {
      const now = Date.now();
      
      // Check if enough time has passed since last scroll action
      if (now - lastScrollTime > scrollCooldown) {
        lastScrollTime = now;
        showNextVisionSlide();
      }
    }
  }, { passive: true });
  
  // We no longer prevent default scrolling behavior
  // This allows for smoother native scrolling

  // Variables to track animation state
  let animationsAlreadyPlayed = false;
  let isOutsideViewport = false;
  
  // Optimized scroll detection for desktop devices
  if (window.innerWidth > 768) {
    // Use Intersection Observer instead of scroll events for better performance
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // When section enters viewport
        if (entry.isIntersecting && isOutsideViewport) {
          // Schedule animation in next frame for smoothness
          requestAnimationFrame(() => {
            animateWorkImages();
          });
          isOutsideViewport = false;
        } 
        // When section leaves viewport
        else if (!entry.isIntersecting && !isOutsideViewport) {
          isOutsideViewport = true;
        }
      });
    }, {
      // Slightly trigger before fully visible for smoother perception
      threshold: 0.15,
      rootMargin: '0px'
    });
    
    // Start observing the work section
    animationObserver.observe(ourWorkSection);
  } else {
    // For mobile: Only play animations once after loader
    animationsAlreadyPlayed = false;
  }
  
  // Directly trigger animations after loader completes
  function triggerWorkAnimations() {
    console.log('Triggering work animations directly');
    // Force animations to play regardless of viewport
    animateWorkImages();
    workSectionVisible = true;
    
    // On mobile, mark as played to prevent repeat on scroll
    if (window.innerWidth <= 768) {
      animationsAlreadyPlayed = true;
    }
  }
  
  // Handle loader completion
  if (loaderVideo) {
    // When loader video ends
    loaderVideo.addEventListener("ended", function() {
      console.log('Loader video ended, triggering animations after delay');
      // Wait a moment after video ends before triggering animations
      setTimeout(triggerWorkAnimations, 50); // Reduced from 100
    });
  } else {
    // Fallback if no video
    console.log('No loader video found, using timeout');
    setTimeout(triggerWorkAnimations, 4000); // Reduced from 8000
  }
  
  // Also trigger on load for mobile devices that might not play the video
  window.addEventListener('load', function() {
    console.log('Window loaded, setting animation trigger');
    // If animations haven't been triggered by video end, do it after a delay
    setTimeout(function() {
      if (!workSectionVisible) {
        console.log('Triggering animations from load event');
        triggerWorkAnimations();
      }
    }, 50); // Reduced from 100
  });

  // High-performance throttle function (better than debounce for animations)
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        requestAnimationFrame(() => {
          inThrottle = false;
        });
      }
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
    const decorationImg = document.querySelector(".deco-img");

    // Update icon visibility based on current theme
    sunIcon.style.display = isDark ? "none" : "block";
    moonIcon.style.display = isDark ? "block" : "none";
    
    // Update logo image based on theme
    if (logoImg) {
      logoImg.src = isDark ? "img/SUAV LOGO2.png" : "img/SUAV LOGO3.png";
    }

    // Update decoration image based on theme
    if (decorationImg) {
      decorationImg.src = isDark ? "img/decoration2.png" : "img/decoration.png";
    }
  }
});
