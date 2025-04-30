document.addEventListener("DOMContentLoaded", function () {
  const visionSlides = document.querySelectorAll(".vision-slide");
  const workImages = document.querySelectorAll(".work-img");
  const ourWorkSection = document.querySelector(".our-work");
  const loaderVideo = document.querySelector(".loader-video");
  const visionContainer = document.querySelector(".vision-container");
  
  let isWorkSectionVisible = false;
  let visionAnimationDone = false;
  let currentVisionSlide = 0;
  let visionSlidesComplete = false;
  let scrollingEnabled = false;
  let isScrollLocked = true; // New variable to track scroll lock state

  console.log("Script initialized", {
    visionSlides: visionSlides.length,
    scrollingEnabled: scrollingEnabled,
    isScrollLocked: isScrollLocked
  });

  // Initialize AOS for other elements
  AOS.init({
    duration: 800,
    easing: "ease-out",
    once: true
  });

  // Make sure all vision slides are hidden initially except the first one
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
    if (visionAnimationDone) return;
    
    setTimeout(() => {
      if (visionSlides.length > 0) {
        // Add the active class to make first slide visible
        visionSlides[0].classList.add("active");
        currentVisionSlide = 0;

        // Mark animation as started
        visionAnimationDone = true;

        // Enable scroll handling after first slide is shown
        setTimeout(() => {
          scrollingEnabled = true;
          
          // Apply scroll lock
          enableScrollLock();
        }, 300);
      }
    }, 200);
  }

  // Function to show next vision slide
  function showNextVisionSlide() {
    // If we're already at the last slide
    if (currentVisionSlide >= visionSlides.length - 1) {
      // We've seen all slides, unlock scrolling
      visionSlidesComplete = true;
      disableScrollLock();
      return false;
    }

    // Temporarily disable scrolling to prevent multiple rapid transitions
    scrollingEnabled = false;

    // Hide current slide with animation
    visionSlides[currentVisionSlide].classList.remove("active");

    // Show next slide with animation
    currentVisionSlide++;
    visionSlides[currentVisionSlide].classList.add("active");

    // Re-enable scroll detection after transition completes
    setTimeout(() => {
      scrollingEnabled = true;
    }, 300);

    return true; // Successfully showed next slide
  }

  // Enable scroll lock
  function enableScrollLock() {
    isScrollLocked = true;
    
    // Store the current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Get position of vision container
    const visionRect = visionContainer.getBoundingClientRect();
    const visionPosition = scrollPosition + visionRect.top;
    
    // Apply fixed position to body to prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    
    console.log("Scroll lock enabled");
  }

  // Disable scroll lock
  function disableScrollLock() {
    if (!isScrollLocked) return;
    
    isScrollLocked = false;
    
    // Get the scroll position from body's top property
    const scrollY = document.body.style.top;
    
    // Remove fixed positioning
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    
    // Restore scroll position
    window.scrollTo(0, parseInt(scrollY || '0') * -1);
    
    console.log("Scroll lock disabled - all slides viewed");
  }

  // Handle wheel events while locked
  function handleWheel(e) {
    if (!isScrollLocked || !scrollingEnabled) return;
    
    // Determine scroll direction
    const direction = e.deltaY > 0 ? 'down' : 'up';
    
    if (direction === 'down') {
      // Scroll down: show next slide
      showNextVisionSlide();
    } else if (direction === 'up' && currentVisionSlide > 0) {
      // Scroll up: show previous slide (optional)
      // This allows users to go back to previous slides
      scrollingEnabled = false;
      visionSlides[currentVisionSlide].classList.remove("active");
      currentVisionSlide--;
      visionSlides[currentVisionSlide].classList.add("active");
      
      setTimeout(() => {
        scrollingEnabled = true;
      }, 300);
    }
    
    // Prevent default scroll behavior
    e.preventDefault();
  }

  // Handle touch events for mobile
  let touchStartY = 0;
  
  function handleTouchStart(e) {
    if (!isScrollLocked) return;
    touchStartY = e.touches[0].clientY;
  }
  
  function handleTouchMove(e) {
    if (!isScrollLocked || !scrollingEnabled) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;
    
    // Minimum swipe distance to trigger slide change
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe up - show next slide
        showNextVisionSlide();
      } else if (diff < 0 && currentVisionSlide > 0) {
        // Swipe down - show previous slide (optional)
        scrollingEnabled = false;
        visionSlides[currentVisionSlide].classList.remove("active");
        currentVisionSlide--;
        visionSlides[currentVisionSlide].classList.add("active");
        
        setTimeout(() => {
          scrollingEnabled = true;
        }, 300);
      }
      
      // Update starting position for next move
      touchStartY = touchY;
      
      // Prevent default behavior
      e.preventDefault();
    }
  }

  // Set up event listeners for wheel and touch events
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: false });
  
  // Add keyboard navigation
  window.addEventListener('keydown', function(e) {
    if (!isScrollLocked || !scrollingEnabled) return;
    
    if (e.key === 'ArrowDown' || e.key === 'Space') {
      showNextVisionSlide();
      e.preventDefault();
    } else if (e.key === 'ArrowUp' && currentVisionSlide > 0) {
      scrollingEnabled = false;
      visionSlides[currentVisionSlide].classList.remove("active");
      currentVisionSlide--;
      visionSlides[currentVisionSlide].classList.add("active");
      
      setTimeout(() => {
        scrollingEnabled = true;
      }, 300);
      e.preventDefault();
    }
  });

  // High-performance animation function for work images (keeping original functionality)
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
      { element: elements.second, type: 'custom-flip-right', delay: 50 }, 
      { element: elements.third, type: 'custom-flip-up', delay: 100 }, 
      { element: elements.fourth, type: 'custom-flip-down', delay: 150 }
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
    if (ourWorkSection) {
      animationObserver.observe(ourWorkSection);
    }
  }

  // Add visual indicator for scroll lock (optional)
  function createScrollIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = `
      <div class="indicator-dots">
        ${Array.from(visionSlides).map((_, i) => 
          `<span class="indicator-dot ${i === 0 ? 'active' : ''}"></span>`
        ).join('')}
      </div>
      <div class="indicator-arrow">
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12L0 2L2 0L10 8L18 0L20 2L10 12Z" fill="#7a0034"/>
        </svg>
      </div>
    `;
    
    document.querySelector('.vision-container').appendChild(indicator);
    
    // Update indicator when slides change
    const updateIndicator = () => {
      const dots = indicator.querySelectorAll('.indicator-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentVisionSlide);
      });
      
      // Hide arrow on last slide
      const arrow = indicator.querySelector('.indicator-arrow');
      arrow.style.opacity = currentVisionSlide >= visionSlides.length - 1 ? '0' : '1';
    };
    
    // Add observer to watch for slide changes
    const slideObserver = new MutationObserver(() => {
      updateIndicator();
    });
    
    visionSlides.forEach(slide => {
      slideObserver.observe(slide, { attributes: true });
    });
  }
  
  // Create scroll indicator
  createScrollIndicator();

  // Theme toggle functionality (keeping original functionality)
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
  if (themeToggle) {
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
  }

  // Function to update toggle button appearance
  function updateThemeToggle() {
    if (!themeToggle) return;
    
    const isDark = document.body.classList.contains("darkTheme");
    const sunIcon = document.querySelector(".sun-icon");
    const moonIcon = document.querySelector(".moon-icon");
    const logoImg = document.querySelector(".logo a img");
    const decorationImg = document.querySelector(".deco-img");

    // Update icon visibility based on current theme
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? "none" : "block";
      moonIcon.style.display = isDark ? "block" : "none";
    }
    
    // Update logo image based on theme
    if (logoImg) {
      logoImg.src = isDark ? "img/LOGO.png" : "img/SUAV LOGO3.png";
    }

    // Update decoration image based on theme
    if (decorationImg) {
      decorationImg.src = isDark ? "img/decoration2.png" : "img/decoration3.png";
    }
  }

  console.log("Script setup complete with scroll lock");
});