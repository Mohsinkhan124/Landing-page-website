let display = document.getElementById("display");
let hrInput = document.getElementById("hours");
let minInput = document.getElementById("minutes");
let secInput = document.getElementById("seconds");
let progress = document.getElementById("progress");
let beep = document.getElementById("beep");

let startBtn = document.getElementById("start");
let pauseBtn = document.getElementById("pause");
let resetBtn = document.getElementById("reset");

let totalSeconds = 0;
let remainingSeconds = 0;
let timer = null;
let isPaused = false;

const circleLength = 691;

function updateDisplay() {
  let hrs = Math.floor(remainingSeconds / 3600);
  let mins = Math.floor((remainingSeconds % 3600) / 60);
  let secs = remainingSeconds % 60;

  display.textContent =
    String(hrs).padStart(2, "0") + ":" +
    String(mins).padStart(2, "0") + ":" +
    String(secs).padStart(2, "0");

  let progressValue =
    circleLength - (remainingSeconds / totalSeconds) * circleLength;

  progress.style.strokeDashoffset = progressValue;
}

function startTimer() {
  timer = setInterval(() => {
    remainingSeconds--;
    updateDisplay();

    if (remainingSeconds <= 0) {
  clearInterval(timer);
  timer = null;
  beep.play();

 Swal.fire({
  title: "⏰ Time Completed!",
  text: "Your timer has finished successfully",
  icon: "success",
  timer: 3000,
  timerProgressBar: true,
  showConfirmButton: false,

  heightAuto: false,     // 🔥 MAIN FIX
  scrollbarPadding: false, // 🔥 SECOND FIX

  backdrop: true,
  background: "#1e1e2f",
  color: "#ffffff",

  showClass: {
    popup: 'animate__animated animate__fadeInDown'
  },
  hideClass: {
    popup: 'animate__animated animate__fadeOutUp'
  },
  customClass: {
    timerProgressBar: 'my-progress-bar'
  }
});


  pauseBtn.textContent = "Pause";
  isPaused = false;
}

  }, 1000);

}

startBtn.addEventListener("click", () => {
  if (timer || remainingSeconds > 0) return;

  let hrs = Number(hrInput.value) || 0;
  let mins = Number(minInput.value) || 0;
  let secs = Number(secInput.value) || 0;

  totalSeconds = hrs * 3600 + mins * 60 + secs;
  remainingSeconds = totalSeconds;

  if (totalSeconds <= 0) return;

  updateDisplay();
  startTimer();

hrInput.value = "";
minInput.value = "";
secInput.value = "";
});

pauseBtn.addEventListener("click", () => {
  if (!timer && remainingSeconds === 0) return;

  if (!isPaused) {
    clearInterval(timer);
    timer = null;
    isPaused = true;
    pauseBtn.textContent = "Resume";
  } else {
    startTimer();
    isPaused = false;
    pauseBtn.textContent = "Pause";
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  isPaused = false;

  totalSeconds = 0;
  remainingSeconds = 0;

  display.textContent = "00:00:00";
  progress.style.strokeDashoffset = circleLength;
  pauseBtn.textContent = "Pause";

  hrInput.value = "";
  minInput.value = "";
  secInput.value = "";
});
