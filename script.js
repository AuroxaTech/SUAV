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
  let isScrollLocked = true; // Track scroll lock state
  let workImagesAnimated = false; // Track if work images have been animated

  // Improved mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

  // Force mobile animation pathway for specific browsers or devices
  console.log("Device detected as: " + (isMobile ? "MOBILE" : "DESKTOP"));
  console.log("User Agent: " + navigator.userAgent);
  console.log("Window Width: " + window.innerWidth);

  console.log("Script initialized", {
    visionSlides: visionSlides.length,
    workImages: workImages.length,
    scrollingEnabled: scrollingEnabled,
    isScrollLocked: isScrollLocked,
    isMobile: isMobile
  });

  // Initialize AOS for other elements, but disable for our work images
  AOS.init({
    duration: 800,
    easing: "ease-out",
    once: true, // Important: only animate once
    disable: function() {
      // Disable AOS on mobile and also for our work images
      return isMobile || 
        document.querySelectorAll('.work-img, .third-img').length > 0;
    }
  });
  
  // Remove AOS attributes from our work images to prevent double animation
  document.querySelectorAll('.work-img, .third-img').forEach(img => {
    img.removeAttribute('data-aos');
    img.removeAttribute('data-aos-duration');
    img.removeAttribute('data-aos-delay');
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
      
      // On mobile, animate work images immediately after loader completes
      // if (isMobile) {
      //   console.log("Mobile detected - triggering immediate animation after loader");
      //   setTimeout(() => {
      //     animateWorkImages();
      //   }, 300);
      // }
      // On desktop, we'll use IntersectionObserver instead
    });

    // Fallback in case video doesn't load or has issues
    setTimeout(function () {
      if (!document.body.classList.contains("loaded")) {
        document.body.classList.add("loaded");
        showVisionWithAnimation();
        
        // On mobile, animate work images
        if (isMobile) {
          console.log("Mobile detected - triggering immediate animation (fallback)");
          setTimeout(() => {
            animateWorkImages();
          }, 300);
        }
      }
    }, 5000);
  } else {
    // If video element doesn't exist, use the timeout
    setTimeout(function () {
      document.body.classList.add("loaded");
      showVisionWithAnimation();
      
      // On mobile, animate work images
      if (isMobile) {
        console.log("Mobile detected - triggering immediate animation (no video)");
        setTimeout(() => {
          animateWorkImages();
        }, 300);
      }
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
          
          // Apply scroll lock only on desktop - disable on mobile
          if (!isMobile) {
            enableScrollLock();
          } else {
            // On mobile, we don't want to lock scrolling
            isScrollLocked = false;
            console.log("Skipping scroll lock on mobile");
          }
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

  // Enable scroll lock - only for desktop
  function enableScrollLock() {
    if (isMobile) return; // Skip on mobile devices
    
    isScrollLocked = true;
    
    // Store the current scroll position
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Get position of vision container
    const visionRect = visionContainer ? visionContainer.getBoundingClientRect() : {top: 0};
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

  // Handle wheel events while locked - desktop only
  function handleWheel(e) {
    if (isMobile || !isScrollLocked || !scrollingEnabled) return;
    
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

  // Handle touch events for mobile - simpler approach for mobile
  let touchStartY = 0;
  
  function handleTouchStart(e) {
    // We'll track touch starts even on mobile without scroll lock
    touchStartY = e.touches[0].clientY;
  }
  
  function handleTouchMove(e) {
    // For mobile, we want normal scrolling behavior
    if (isMobile) return;
    
    // This code will only run on desktop with touch
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
      
      // Prevent default behavior on desktop only
      e.preventDefault();
    }
  }

  // Set up event listeners - but handle mobile/desktop differently
  if (!isMobile) {
    // Only add these on desktop
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
  } else {
    // On mobile, we want simple touch navigation for vision slides
    document.addEventListener('swiped-up', function() {
      showNextVisionSlide();
    });
    
    document.addEventListener('swiped-down', function() {
      if (currentVisionSlide > 0) {
        scrollingEnabled = false;
        visionSlides[currentVisionSlide].classList.remove("active");
        currentVisionSlide--;
        visionSlides[currentVisionSlide].classList.add("active");
        
        setTimeout(() => {
          scrollingEnabled = true;
        }, 300);
      }
    });
  }
  
  // Add keyboard navigation - works on both mobile and desktop
  window.addEventListener('keydown', function(e) {
    if (!scrollingEnabled) return;
    
    // On mobile, we don't need scroll lock check
    if (!isMobile && !isScrollLocked) return;
    
    if (e.key === 'ArrowDown' || e.key === ' ') {
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

  // Variable to track whether the our-work section has been observed
  let ourWorkObserved = false;

  // Set up IntersectionObserver for "our-work" section on desktop only
  if (ourWorkSection && !isMobile) {
    const workSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // If the section is entering the viewport and on desktop
        if (entry.isIntersecting) {
          console.log("Our work section is visible - triggering animation");
          animateWorkImages();
          ourWorkObserved = true; // Mark as observed
        } else if (!entry.isIntersecting && ourWorkObserved) {
          // Reset animation state when section goes out of view
          // This allows re-animation when scrolling back to the section
          console.log("Our work section exited viewport - resetting animation state");
          resetWorkImagesAnimation();
          ourWorkObserved = false; // Reset observed state
        }
      });
    }, {
      threshold: 0.2, // Trigger when 20% of the section is visible
      rootMargin: '0px'
    });
    
    // Start observing the work section
    workSectionObserver.observe(ourWorkSection);
    console.log("IntersectionObserver set up for our-work section");
  } else if (isMobile) {
    // For mobile, we'll handle the animation differently
    console.log("Mobile device detected - skipping IntersectionObserver setup");
    
    // For mobile, trigger animation immediately
    setTimeout(() => {
      console.log("Running immediate animation for mobile");
      animateWorkImages();
    }, 500); // Small delay to ensure DOM is ready
  }

  // Function to reset work images animation state
  function resetWorkImagesAnimation() {
    if (isMobile) return; // Don't reset on mobile
    
    workImagesAnimated = false;
    
    // Reset animation classes on all images
    const elements = {
      first: document.querySelector('.first-img'),
      second: document.querySelector('.second-img'),
      third: document.querySelector('.third-img'),
      fourth: document.querySelector('.img-right-side')
    };
    
    // Reset all animation classes
    Object.values(elements).forEach(element => {
      if (element) {
        element.classList.remove('custom-flip-left', 'custom-flip-right', 'custom-flip-up', 'custom-flip-down');
        element.style.opacity = '0';
      }
    });
    
    console.log("Work images animation reset for re-animation");
  }

  // Improved work images animation function that works better on mobile
  function animateWorkImages() {
    // For desktop, only animate if section is visible and not already animated
    if (!isMobile && workImagesAnimated) {
      console.log("Work images already animated, skipping");
      return;
    }
    
    console.log("Animating work images", isMobile ? "on mobile" : "on desktop");
    workImagesAnimated = true; // Mark as animated
    
    // Pre-cache DOM elements for better performance
    const elements = {
      first: document.querySelector('.first-img'),
      second: document.querySelector('.second-img'),
      third: document.querySelector('.third-img'),
      fourth: document.querySelector('.img-right-side')
    };
    
    // Define animations with mobile-friendly timing
    // Use longer delays on mobile for smoother performance
    const animations = [
      { element: elements.first, type: 'custom-flip-left', delay: 0 },
      { element: elements.second, type: 'custom-flip-right', delay: isMobile ? 50 : 50 },
      { element: elements.third, type: 'custom-flip-up', delay: isMobile ? 100 : 100 },
      { element: elements.fourth, type: 'custom-flip-down', delay: isMobile ? 150 : 150 }
    ];
    
    // Ensure all work images are visible before animation
    document.querySelectorAll('.work-img, .third-img').forEach(img => {
      img.style.visibility = 'visible';
    });
    
    // Apply animations with precise timing
    animations.forEach(item => {
      if (item.element) {
        console.log(`Animating ${item.element.className} with ${item.type}`);
        
        // First remove any existing animation classes
        item.element.classList.remove('flip-left', 'flip-right', 'flip-up', 'flip-down');
        item.element.classList.remove('custom-flip-left', 'custom-flip-right', 'custom-flip-up', 'custom-flip-down');
        
        // Force reflow
        void item.element.offsetWidth;
        
        // Schedule animation
        setTimeout(() => {
          item.element.classList.add(item.type);
          item.element.style.opacity = '1';
        }, item.delay);
      }
    });
  }

  // Add CSS for custom animations if not already present
  function addCustomAnimationStyles() {
    if (!document.getElementById('custom-animation-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'custom-animation-styles';
      styleSheet.textContent = `
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .vision-container {
            /* Better performance on mobile */
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
          }
          
          /* Optimize animations for mobile */
          .custom-flip-left, .custom-flip-right, .custom-flip-up, .custom-flip-down {
            animation-duration: 1s; /* Slightly longer for mobile */
          }
        }
        
        .custom-flip-left, .custom-flip-right, .custom-flip-up, .custom-flip-down {
          animation-duration: 0.8s;
          animation-fill-mode: both;
          opacity: 0;
          /* Hardware acceleration */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .custom-flip-left {
          animation-name: customFlipLeft;
        }
        
        .custom-flip-right {
          animation-name: customFlipRight;
        }
        
        .custom-flip-up {
          animation-name: customFlipUp;
        }
        
        .custom-flip-down {
          animation-name: customFlipDown;
        }
        
        @keyframes customFlipLeft {
          from {
            transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotate3d(0, 1, 0, 0deg);
            opacity: 1;
          }
        }
        
        @keyframes customFlipRight {
          from {
            transform: perspective(400px) rotate3d(0, 1, 0, -90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotate3d(0, 1, 0, 0deg);
            opacity: 1;
          }
        }
        
        @keyframes customFlipUp {
          from {
            transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotate3d(1, 0, 0, 0deg);
            opacity: 1;
          }
        }
        
        @keyframes customFlipDown {
          from {
            transform: perspective(400px) rotate3d(1, 0, 0, -90deg);
            opacity: 0;
          }
          to {
            transform: perspective(400px) rotate3d(1, 0, 0, 0deg);
            opacity: 1;
          }
        }
        
        /* Make sure all work images are initially invisible */
        .work-img, .third-img {
          opacity: 0;
          visibility: visible;
          will-change: transform, opacity;
        }
      `;
      document.head.appendChild(styleSheet);
      
      // Add touch swipe detection for mobile devices
      if (isMobile) {
        const swipeScript = document.createElement('script');
        swipeScript.textContent = `
          // Swipe detection
          (function() {
            let touchstartX = 0;
            let touchstartY = 0;
            let touchendX = 0;
            let touchendY = 0;
            
            const threshold = 50; // minimum distance for a swipe
            
            document.addEventListener('touchstart', function(event) {
              touchstartX = event.changedTouches[0].screenX;
              touchstartY = event.changedTouches[0].screenY;
            }, false);
            
            document.addEventListener('touchend', function(event) {
              touchendX = event.changedTouches[0].screenX;
              touchendY = event.changedTouches[0].screenY;
              handleGesture();
            }, false);
            
            function handleGesture() {
              const deltaX = touchendX - touchstartX;
              const deltaY = touchendY - touchstartY;
              
              if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
                if (deltaY < 0) {
                  const event = new Event('swiped-up');
                  document.dispatchEvent(event);
                } else {
                  const event = new Event('swiped-down');
                  document.dispatchEvent(event);
                }
              }
            }
          })();
        `;
        document.head.appendChild(swipeScript);
      }
    }
  }
  
  // Add custom animation styles
  addCustomAnimationStyles();

  // Add visual indicator for scroll lock (optional) - with mobile optimizations
  function createScrollIndicator() {
    if (!visionContainer) return;
    
    // Remove existing indicator if any
    const existingIndicator = document.querySelector('.scroll-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    
    // Add mobile class if needed
    if (isMobile) {
      indicator.classList.add('mobile');
    }
    
    indicator.innerHTML = `
      <div class="indicator-dots">
        ${Array.from(visionSlides).map((_, i) => 
          `<span class="indicator-dot ${i === 0 ? 'active' : ''}"></span>`
        ).join('')}
      </div>
    `;
    
    visionContainer.appendChild(indicator);
    
    // Update indicator when slides change
    const updateIndicator = () => {
      const dots = indicator.querySelectorAll('.indicator-dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentVisionSlide);
      });
    };
    
    // Add observer to watch for slide changes
    const slideObserver = new MutationObserver(() => {
      updateIndicator();
    });
    
    visionSlides.forEach(slide => {
      slideObserver.observe(slide, { attributes: true });
    });
    
    // On mobile, make dots clickable
    if (isMobile) {
      const dots = indicator.querySelectorAll('.indicator-dot');
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          // Don't process if animation is in progress
          if (!scrollingEnabled) return;
          
          // Hide current slide
          scrollingEnabled = false;
          visionSlides[currentVisionSlide].classList.remove("active");
          
          // Show clicked slide
          currentVisionSlide = i;
          visionSlides[currentVisionSlide].classList.add("active");
          
          // Update dots
          updateIndicator();
          
          // Re-enable scrolling after animation
          setTimeout(() => {
            scrollingEnabled = true;
          }, 300);
        });
      });
    }
  }
  
  // Create scroll indicator if vision container exists
  if (visionContainer) {
    createScrollIndicator();
  }

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

  console.log("Script setup complete with optimizations for both desktop and mobile");
});