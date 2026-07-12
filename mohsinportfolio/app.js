//  ============ toggle icon navbar ==========
let menuTcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuTcon.onclick = () => {
    menuTcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');

}


// ===== Scroll Section Active =========

let sections = document.querySelectorAll("section");
let navlinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if(top >= offset && top < offset + height) {
            navlinks.forEach(links => {
                links.classList.remove('active');
                document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
            })
        }
    });

    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    menuTcon.classList.remove('bx-x');
    navbar.classList.remove('active');
}


// ========== scroll revael ==============

 ScrollReveal({
    // reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

// ============== typed js =================

const typed = new Typed('.multiple-text', {
    strings: ['MERN Stack Developer', 'Full Stack Web Developer', 'React & Node.js Expert'],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true
});


// ========== download CV =============
document.getElementById('downloadBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Apni CV file ka sahi path daalo
    const fileUrl = 'images/mernstack.pdf'; // PDF file name
    const fileName = 'Mohsin_Khan_CV.pdf';
    
    // Direct download trigger
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});



    // ========== contact form validation =============

   document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let number = document.getElementById("number").value.trim();
  let subject = document.getElementById("subject").value.trim();
  let message = document.getElementById("message").value.trim();
  let errorMsg = document.getElementById("error-msg");

  // Validation
  if (!name || !email || !number || !subject || !message) {
    Swal.fire({
      icon: "error",
      title: "Missing Fields",
      text: "Please fill out all fields!",
    });
    return;
  }

  if (!email.endsWith("@gmail.com")) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Email",
      text: "Email must end with @gmail.com!",
    });
    return;
  }

  // Clear errors
  errorMsg.textContent = "";

  // Show sending message
  Swal.fire({
    title: "Sending...",
    text: "Please wait while your message is being sent.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  // Form data
  const formData = new FormData(this);

  // Formspree API Call
  fetch(this.action, {
    method: this.method,
    body: formData,
    headers: { 'Accept': 'application/json' }
  })
  .then(response => {
    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you, your message has been delivered successfully!",
      });
      this.reset();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong. Please try again later.",
      });
    }
  })
  .catch(() => {
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Check your internet connection and try again.",
    });
  });
});
