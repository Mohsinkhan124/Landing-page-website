
const API_KEY = "bb83484ab6b0ef2b2b2bdb8b";
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest`;

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const swapBtn = document.querySelector(".swap");
const historyList = document.querySelector(".history ul"); 

const MAX_LIMIT = 100000000000000;

const lastFrom = localStorage.getItem("lastFrom");
const lastTo = localStorage.getItem("lastTo");

for (let select of dropdowns) {
  for (let currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from") {
      newOption.selected = lastFrom ? lastFrom === currCode : currCode === "USD";
    } else if (select.name === "to") {
      newOption.selected = lastTo ? lastTo === currCode : currCode === "PKR";
    }

    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

const addHistory = (text) => {
  let li = document.createElement("li");
  li.innerText = text;
  historyList.prepend(li); 

  const currentHistory = JSON.parse(localStorage.getItem("history") || "[]");
  currentHistory.unshift(text); 
  localStorage.setItem("history", JSON.stringify(currentHistory));
};

const loadHistory = () => {
  const savedHistory = JSON.parse(localStorage.getItem("history") || "[]");
  for (let entry of savedHistory) {
    let li = document.createElement("li");
    li.innerText = entry;
    historyList.appendChild(li);
  }
};

const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount input");
  let amtVal = amount.value;

  if (amtVal === "" || amtVal < 1) {
    amtVal = 1;
    amount.value = "1";
  }

  if (amtVal > MAX_LIMIT) {
    alert("Amount 100 Trillion se zyada nahi ho sakta!");
    amount.value = MAX_LIMIT;
    return;
  }

  try {
    const URL = `${BASE_URL}/${fromCurr.value}`;
    let response = await fetch(URL);
    let data = await response.json();

    let rate = data.conversion_rates[toCurr.value];
    let finalAmount = amtVal * rate;

    const resultText = `${amtVal} ${fromCurr.value} = ${finalAmount.toFixed(2)} ${toCurr.value}`;
    msg.innerText = resultText;

    localStorage.setItem("lastFrom", fromCurr.value);
    localStorage.setItem("lastTo", toCurr.value);

    addHistory(resultText);

  } catch (error) {
    msg.innerText = "Net Connection lose";
    console.error(error);
  }
};

swapBtn.addEventListener("click", () => {
  let temp = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = temp;

  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", () => {
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
  loadHistory();
});

const historyToggle = document.querySelector(".history-toggle");
const historyDiv = document.querySelector(".history");

historyToggle.addEventListener("click", () => {
  historyDiv.classList.toggle("show");
});