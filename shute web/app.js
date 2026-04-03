const slider = document.querySelector(".slider");
    const dots = document.querySelectorAll(".dot");
    
    let index = 0;
    let isDragging = false;
    let startX = 0;

    function updateSlider() {
        slider.style.transform = `translateX(-${index * 100}%)`;

        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    // Mouse down
    slider.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.pageX;
    });

    // Mouse up
    slider.addEventListener("mouseup", (e) => {
        if (!isDragging) return;
        isDragging = false;

        let diff = e.pageX - startX;

        if (diff < -50 && index < 2) index++;
        if (diff > 50 && index > 0) index--;

        updateSlider();
    });

    slider.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    // Dot click
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            updateSlider();
        });
    });