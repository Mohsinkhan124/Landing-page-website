var firebaseConfig = {
  apiKey: "AIzaSyCB6NTCQ90Mlfj1jSq0RBtlONgn8UDlrdM",
  authDomain: "mohsin-portfolio-4aca9.firebaseapp.com",
  databaseURL: "https://mohsin-portfolio-4aca9-default-rtdb.firebaseio.com",
  projectId: "mohsin-portfolio-4aca9",
  storageBucket: "mohsin-portfolio-4aca9.firebasestorage.app",
  messagingSenderId: "952247237398",
  appId: "1:952247237398:web:95bb91ac06d84613436e37",
  measurementId: "G-0FPL7X3YBF"
};

// Initialize Firebase
var app = firebase.initializeApp(firebaseConfig);
var database = firebase.database();

document.getElementById("signupBtn").addEventListener("click", function (e) {
  e.preventDefault();

  // Fields
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const size = document.getElementById("size");
  const address = document.getElementById("address");

  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

  // Errors clear
  document.querySelectorAll(".error").forEach(el => el.textContent = "");

  // ✅ Validation (unchanged)
  let isValid = true;
  if (name.value.trim() === "") {
    document.getElementById("name-error").textContent = "Please enter your name";
    isValid = false;
  }
  if (!emailPattern.test(email.value.trim())) {
    document.getElementById("email-error").textContent = "Enter a valid email";
    isValid = false;
  }
  if (phone.value.trim().length < 10) {
    document.getElementById("phone-error").textContent = "Enter a valid phone number";
    isValid = false;
  }
  if (size.value.trim() === "") {
    document.getElementById("size-error").textContent = "Enter property size";
    isValid = false;
  }
  if (address.value.trim() === "") {
    document.getElementById("address-error").textContent = "Enter property address";
    isValid = false;
  }

  if (!isValid) return;

  // ✅ Store data in Firebase Database
  var formData = {
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    size: size.value.trim(),
    address: address.value.trim(),
    timestamp: new Date().toLocaleString()
  };

  database.ref("LandingPageForm").push(formData)
    .then(function () {
      alert("✅ Form submitted successfully!");
      // Clear fields manually
      name.value = "";
      email.value = "";
      phone.value = "";
      size.value = "";
      address.value = "";
    })
    .catch(function (error) {
      alert("❌ Error submitting form: " + error.message);
      console.error("Database Error:", error);
    });
});
