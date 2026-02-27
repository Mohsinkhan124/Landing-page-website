const menuIcon = document.getElementById("menuIcon");
  const navMenu = document.getElementById("navMenu");

  let isOpen = false;

  menuIcon.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    if (!isOpen) {
      menuIcon.className = "ri-close-line menu-icon";
      isOpen = true;
    } else {
      menuIcon.className = "ri-menu-4-line menu-icon";
      isOpen = false;
    }
  });

  // Specs Images

  const images = [
    "./images/specs.webp",
    "./images/specs1.webp",
    "./images/specs2.webp"
  ];

  let currentIndex = 0;
  const imageElement = document.getElementById("specsImage");

  setInterval(() => {
    imageElement.style.opacity = 0;

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % images.length;
      imageElement.src = images[currentIndex];
      imageElement.style.opacity = 1;
    }, 300);
  }, 5000);

  // Testimonial

  const carousel = document.getElementById("testimonialCarousel");
const cards = carousel.children;
let index = 0;

setInterval(() => {
  index = (index + 1) % cards.length;
  const offset = cards[0].offsetWidth + 30; // card width + gap
  carousel.scrollTo({
    left: index * offset,
    behavior: "smooth"
  });
}, 3000);

// action coursel

const slides = document.querySelectorAll(".cta-slide");
let slideIndex = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    if(i === index) slide.classList.add("active");
  });
}

// Initial display
showSlide(slideIndex);

// Auto rotate every 3 seconds
setInterval(() => {
  slideIndex = (slideIndex + 1) % slides.length;
  showSlide(slideIndex);
}, 3000);