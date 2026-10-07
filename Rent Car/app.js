const track = document.getElementById("testimonialTrack");
const cards = document.querySelectorAll(".testimonial-card");

const firstClone = cards[0].cloneNode(true);
const lastClone = cards[cards.length - 1].cloneNode(true);

track.appendChild(firstClone);
track.insertBefore(lastClone, track.firstChild);

let currentIndex = 1;

function getSliderValues() {
    const card = document.querySelector(".testimonial-card");

    const cardWidth = card.getBoundingClientRect().width;

    const trackStyle = window.getComputedStyle(track);
    const gap = parseFloat(trackStyle.gap) || 0;

    return {
        cardWidth,
        gap,
        moveAmount: cardWidth + gap
    };
}


function updateSlider(animate = true) {

    const { cardWidth, moveAmount } = getSliderValues();

    track.style.transition = animate
        ? "transform 0.8s ease-in-out"
        : "none";

    track.style.transform =
        `translateX(calc(50vw - ${cardWidth / 2}px - ${currentIndex * moveAmount}px))`;
}


// Initial position
updateSlider(false);


// Next Slide
function nextSlide() {

    currentIndex++;

    updateSlider(true);


    // Clone ke baad original first card par wapas
    if (currentIndex === cards.length + 1) {

        setTimeout(() => {

            currentIndex = 1;

            updateSlider(false);

        }, 800);
    }
}


// Har 3 seconds baad next slide
setInterval(nextSlide, 3000);


// Screen resize hone par position recalculate
window.addEventListener("resize", () => {

    updateSlider(false);

});