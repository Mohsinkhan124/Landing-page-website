
const searchBox = document.getElementById("search");
const mobileInput = document.getElementById("mobile-search");
const weatherIcon = document.querySelector(".weather-icon");
const loader = document.querySelector(".loader");
const weatherDiv = document.querySelector(".weather");
const detailsDiv = document.querySelector(".details");
const toast = document.getElementById("toast");
const recentList = document.getElementById("recentList");


function showToast(message) {
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


async function WeatherApp(city) {
    try {
        if (!city) city = "Karachi"; 

        loader.style.display = "flex";
        weatherDiv.style.display = "none";
        detailsDiv.style.display = "none";

        const API_KEY = "751f651fb450b3414ec659c21c8d4c88";
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await res.json();

        if (data.cod === "404") {
            showToast("City not found!");
            loader.style.display = "none";
            return;
        }

        document.querySelector(".city").innerText = data.name;
        document.querySelector(".temp").innerText = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerText = data.main.humidity + "%";
        document.querySelector(".wind").innerText = data.wind.speed + " km/h";

        if (data.weather[0].main === "Clouds") weatherIcon.src = "./images/clouds.png";
        else if (data.weather[0].main === "Clear") weatherIcon.src = "./images/clear.png";
        else if (data.weather[0].main === "Rain") weatherIcon.src = "./images/rain.png";
        else if (data.weather[0].main === "Drizzle") weatherIcon.src = "./images/drizzle.png";
        else if (data.weather[0].main === "Mist") weatherIcon.src = "./images/mist.png";
        else weatherIcon.src = "./images/clouds.png";

       
        loader.style.display = "none";
        weatherDiv.style.display = "flex";
        detailsDiv.style.display = "flex";

       
        searchBox.value = data.name;
        if (mobileInput) mobileInput.value = data.name;

        
        saveRecentCity(data.name);

    } catch (err) {
        console.error("Error:", err);
        loader.style.display = "none";
        weatherDiv.style.display = "flex";
        detailsDiv.style.display = "flex";
        showToast("Network error! Please try again.");
    }
}

document.querySelector(".search-bar button").addEventListener("click", () => {
    WeatherApp(searchBox.value);
});

searchBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") WeatherApp(searchBox.value);
});

document.getElementById("mobile-btn")?.addEventListener("click", () => {
    WeatherApp(mobileInput.value);
});

mobileInput?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") WeatherApp(mobileInput.value);
});

document.getElementById("recent-toggle")?.addEventListener("click", () => {
    document.querySelector(".recent-searches").classList.toggle("active");
});

function saveRecentCity(city) {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
    localStorage.setItem("recentCities", JSON.stringify(cities));
    renderRecentCities();
}

function renderRecentCities() {
    let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
    recentList.innerHTML = "";
    cities.forEach(city => {
        const li = document.createElement("li");
        li.innerText = city;
        recentList.appendChild(li);
    });

    attachRecentClick(); 
}

function attachRecentClick() {
    document.querySelectorAll(".recent-searches ul li").forEach(li => {
        li.onclick = () => {
            const city = li.innerText;

           
            searchBox.value = city;
            if (mobileInput) mobileInput.value = city;

            WeatherApp(city);

            
            document.querySelector(".recent-searches").classList.remove("active");
        }
    });
}

window.addEventListener("DOMContentLoaded", () => {
    WeatherApp("Karachi");
    renderRecentCities();
});
