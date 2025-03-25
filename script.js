document.addEventListener('DOMContentLoaded', function() {
  const visionSlides = document.querySelectorAll('.vision-slide');
  const visionSection = document.querySelector('.vision-container');
  const workImages = document.querySelectorAll('.work-img');
  const ourWorkSection = document.querySelector('.our-work');
  
  let currentSlide = 0;
  let isAnimating = false;
  let allSlidesViewed = false;
  let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  let isWorkSectionVisible = false;
  
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: false,
    mirror: false
  });
  
  // Loader animation
  setTimeout(function() {
    document.body.classList.add('loaded');
  }, 2000);
  
  // Function to animate work images with flip effect
  function animateWorkImages() {
    // Reset all images first
    workImages.forEach(img => {
      img.classList.remove('flip-in');
    });
    
    // Trigger reflow to ensure animations restart
    void ourWorkSection.offsetWidth;
    
    // Add animation with delay
    workImages.forEach((img, index) => {
      setTimeout(() => {
        img.classList.add('flip-in');
      }, index * 200); // Stagger the animations
    });
  }
  
  // Check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
      rect.bottom >= 0
    );
  }
  
  // Function to change slides
  function changeVisionSlide(direction) {
    if (isAnimating || allSlidesViewed) return;
    
    isAnimating = true;
    
    // Get current and next slide indexes
    let nextSlide;
    if (direction === 'down') {
      nextSlide = (currentSlide + 1) % visionSlides.length;
    } else {
      nextSlide = (currentSlide - 1 + visionSlides.length) % visionSlides.length;
    }
    
    // Add animation classes
    visionSlides[currentSlide].classList.add('slide-out');
    visionSlides[currentSlide].classList.remove('active');
    
    setTimeout(() => {
      visionSlides[nextSlide].classList.add('slide-in', 'active');
      
      // Update current slide
      currentSlide = nextSlide;
      
      // Check if we've viewed all slides
      if (currentSlide === visionSlides.length - 1) {
        allSlidesViewed = true;
      }
      
      // Remove animation classes after animation completes
      setTimeout(() => {
        visionSlides.forEach(slide => {
          slide.classList.remove('slide-in', 'slide-out');
        });
        isAnimating = false;
      }, 800);
    }, 400);
  }
  
  // Check for animations on scroll
  window.addEventListener('scroll', function() {
    // Check if work section is in viewport
    const workSectionVisible = isInViewport(ourWorkSection);
    
    // If section visibility changed from invisible to visible
    if (workSectionVisible && !isWorkSectionVisible) {
      animateWorkImages();
    }
    
    // Update section visibility state
    isWorkSectionVisible = workSectionVisible;
    
    // If all slides have been viewed, allow normal scrolling
    if (allSlidesViewed) return;
    
    const st = window.pageYOffset || document.documentElement.scrollTop;
    const visionPosition = visionSection.getBoundingClientRect();
    
    // Check if vision section is in viewport and we're animating
    if (visionPosition.top < window.innerHeight && 
        visionPosition.bottom > 0 && 
        isAnimating) {
      // Keep the page position fixed during animation
      window.scrollTo(0, lastScrollTop);
    } else {
      // Update last scroll position when not animating
      lastScrollTop = st <= 0 ? 0 : st;
    }
  });
  
  // Handle wheel events to change slides without scrolling
  window.addEventListener('wheel', function(e) {
    // If all slides have been viewed, allow normal scrolling
    if (allSlidesViewed) return;
    
    const visionPosition = visionSection.getBoundingClientRect();
    
    // Check if vision section is in viewport
    if (visionPosition.top < window.innerHeight && visionPosition.bottom > 0) {
      // Determine scroll direction
      if (e.deltaY > 0 && currentSlide < visionSlides.length - 1) {
        // Scrolling down
        e.preventDefault();
        changeVisionSlide('down');
      } else if (e.deltaY < 0 && currentSlide > 0) {
        // Scrolling up
        e.preventDefault();
        changeVisionSlide('up');
      }
    }
  }, { passive: false });
  
  // Touch events for mobile
  let touchStartY = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    // If all slides have been viewed, allow normal scrolling
    if (allSlidesViewed) return;
    
    const visionPosition = visionSection.getBoundingClientRect();
    
    // Check if vision section is in viewport
    if (visionPosition.top < window.innerHeight && visionPosition.bottom > 0) {
      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;
      
      if (diff > 5 && !isAnimating && currentSlide < visionSlides.length - 1) { // Scrolling down
        e.preventDefault();
        changeVisionSlide('down');
      } else if (diff < -5 && !isAnimating && currentSlide > 0) { // Scrolling up
        e.preventDefault();
        changeVisionSlide('up');
      }
      
      touchStartY = touchY;
    }
  }, { passive: false });
});
