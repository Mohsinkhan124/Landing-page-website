//  ============ toggle icon navbar ==========
let menuTcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar-links');

menuTcon.onclick = () => {
  menuTcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');

}


// =========== Array of Objects =============

let items = [
  { text: "Indoor / Outdoor Custom Paddle Ball Sets", image: "./images/Image 1.png" },
  { text: "BLUE or RED w/ WHITE PADDLE RACKET SET", image: "./images/Image 4.png" },
  { text: "Paddle Set Game(s)", image: "./images/Image 5.png" },
  { text: "PICKLEBALL PADDLE SET", image: "./images/Image 9.png" },
  { text: "Ping Pong Paddles", image: "./images/Image 10.png" },
  { text: "Paddle Set Game(s)", image: "./images/Image 5.png" },
  { text: "MESH PADDLES", image: "./images/Image 11.png" },
  { text: "PICKLEBALL PADDLE SET", image: "./images/Image 9.png" },
  { text: "Indoor / Outdoor Custom Paddle Ball Sets", image: "./images/Image 1.png" },
  { text: "BLUE or RED w/ WHITE PADDLE RACKET SET", image: "./images/Image 4.png" },
  { text: "Paddle Set Game(s)", image: "./images/Image 5.png" },
  { text: "PICKLEBALL PADDLE SET", image: "./images/Image 9.png" },
  { text: "Ping Pong Paddles", image: "./images/Image 10.png" },
  { text: "Paddle Set Game(s)", image: "./images/Image 5.png" },
  { text: "MESH PADDLES", image: "./images/Image 11.png" },
  { text: "PICKLEBALL PADDLE SET", image: "./images/Image 9.png" },
];

let items2 = [
  { text: "Promotional Wooden Paddles", image: "./images/Image 12.png" },
  { text: "Bamboo Flight Paddle", image: "./images/Image 13.png" },
  { text: "Pizza Peel Paddles", image: "./images/Image 14.png" },
  { text: "PREMIUM CHERRYWOOD or WALNUT PADDLE", image: "./images/Image 17.png" },
  { text: "Paddle Cutting Board", image: "./images/Image 15.png" },
  { text: "BAMBOO PADDLE", image: "./images/Image 16.png" },
];

let card = document.getElementById("card-box");
let card2 = document.getElementById("sec4-box");

items.forEach((elem, idx) => {
  card.innerHTML += `
    <div class="col-6 col-md-3">
        <div class="sec3-box">
          <div class="box-image">
            <img src="${elem.image}" alt="Image 3">
          </div>
          <div class="box-text">
            <p>${elem.text}</p>
          </div>
        </div>
      </div>
   `
});

items2.forEach((elem, idx) => {
  card2.innerHTML += `
    <div class="col-6 col-md-3">
        <div class="sec3-box">
          <div class="box-image">
            <img src="${elem.image}" alt="Image 3">
          </div>
          <div class="box-text">
            <p>${elem.text}</p>
          </div>
        </div>
      </div>
   `
});

// ===== Scroll Section Active =========

let sections = document.querySelectorAll(".section");
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

let name = document.getElementById("name");
let email = document.getElementById("email");
let number = document.getElementById("number");
let company = document.getElementById("company");
let item = document.getElementById("item");
let Qnumber = document.getElementById("Qnumber");
let date = document.getElementById("date");
let message = document.getElementById("message");

let SubmitBTN = document.getElementsByClassName("sec10-btn");

SubmitBTN[0].addEventListener("click", function (e) {
  e.preventDefault();

  // purane errors hatao
  document.querySelectorAll(".error").forEach(err => err.remove());

  let valid = true;

  // NAME
  if (name.value.trim() === "") {
    showError(name, "Name is required");
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

  // NUMBER
  if (number.value.trim() === "") {
    showError(number, "Number is required");
    valid = false;
  } else if (number.value.length < 10) {
    showError(number, "Invalid number");
    valid = false;
  }

  // COMPANY
  if (company.value.trim() === "") {
    showError(company, "Company name required");
    valid = false;
  }

  // ITEM
  if (item.value.trim() === "") {
    showError(item, "Item name required");
    valid = false;
  }

  // QUANTITY
  if (Qnumber.value.trim() === "") {
    showError(Qnumber, "Quantity required");
    valid = false;
  } else if (Qnumber.value <= 0) {
    showError(Qnumber, "Quantity must be greater than 0");
    valid = false;
  }

  // DATE
  if (date.value.trim() === "") {
    showError(date, "Date required");
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
    name.value = "";
    email.value = "";
    number.value = "";
    company.value = "";
    item.value = "";
    Qnumber.value = "";
    date.value = "";
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
    background: "#0f172a",
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
    background: "linear-gradient(135deg, #0f766e, #0891b2)",
    color: "#fff",
    iconColor: "#22c55e",
    confirmButtonText: "Done",
    confirmButtonColor: "#22c55e",
    timer: 3000,
    timerProgressBar: true,
    showClass: {
      popup: "animate__animated animate__zoomIn"
    }
  });
}
