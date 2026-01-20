//  ============ toggle icon navbar ==========
let menuTcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbars');

menuTcon.onclick = () => {
    menuTcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');

}

// ===== Scroll Section Active =========

let sections = document.querySelectorAll(".sections");
let navlinks = document.querySelectorAll("header nav a");

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute("id");

        if (top >= offset && top < offset + height) {
            navlinks.forEach(link => {
                link.classList.remove("active");
            });

            let activeLink = document.querySelector(
                "header nav a[href*='" + id + "']"
            );

            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    });


    let header = document.querySelector('header');
    header.classList.toggle('sticky', window.scrollY > 100);

    menuTcon.classList.remove('bx-x');
    navbar.classList.remove('active');
}


// ============ Form Validation ==============

let names = document.getElementById("name");
let subject = document.getElementById("subject");
let email = document.getElementById("email");
let message = document.getElementById("message");

let SubmitBTN = document.getElementById("submitbtn");

SubmitBTN.addEventListener("click", function (e) {
  e.preventDefault();

  // purane errors hatao
  document.querySelectorAll(".error").forEach(err => err.remove());

  let valid = true;

  // NAME
  if (names.value.trim() === "") {
    showError(names, "Name is required");
    valid = false;
  }

  // EMAIL
  if (email.value.trim() === "") {
    showError(email, "Email is required");
    valid = false;
  } else if (!email.value.includes("@")) {
    showError(email, "Invalid email");
    valid = false;
  }

  // subject
  if (subject.value.trim() === "") {
    showError(subject, "subject is required");
    valid = false;
  }


  // MESSAGE
  if (message.value.trim() === "") {
    showError(message, "Message required");
    valid = false;
  }

  // SweetAlert result
  if (!valid) {
   errorAlert();
  } else {
    successAlert()

    // form clear
    names.value = "";
    email.value = "";
    subject.value = "";
    message.value = "";
  }
});

// error show function
function showError(input, msg) {
  let span = document.createElement("span");
  span.className = "error";
  span.innerText = msg;
  input.insertAdjacentElement("afterend", span);
}

// ERROR ALERT
function errorAlert() {
  Swal.fire({
    icon: "error",
    title: "Oops!",
    text: "Please fill all fields correctly",
    background: "#344b30",
    color: "#fff",
    iconColor: "#ff4d4d",
    confirmButtonText: "Fix Errors",
    confirmButtonColor: "#ff4d4d",
    showClass: {
      popup: "animate__animated animate__shakeX"
    }
  });
}

// SUCCESS ALERT
function successAlert() {
  Swal.fire({
    icon: "success",
    title: "Submitted 🎉",
    text: "Your form has been sent successfully",
    background: "linear-gradient(135deg, #344b30, #212d1f)",
    color: "#fff",
    iconColor: "#22c55e",
    confirmButtonText: "Done",
    confirmButtonColor: "#22c55e",
    timer: 2000,
    timerProgressBar: true,
    showClass: {
      popup: "animate__animated animate__zoomIn"
    }
  });
}
