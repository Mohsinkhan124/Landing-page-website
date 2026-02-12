var startBtn = document.querySelector(".start-btn"),
    popupInfo = document.querySelector(".popup-info"),
    ExitBtn = document.querySelector(".exit-btn"),
    main = document.querySelector(".main"),
    continueBtn = document.querySelector(".continue-btn"),
    quizSection = document.querySelector(".quiz-section"),
    quizBox = document.querySelector(".quiz-box"),
    resultBox = document.querySelector(".result-box"),
    tryAgainBtn = document.querySelector(".tryagain-btn"),
    goHomeBtn = document.querySelector(".goHome-btn");
startBtn.addEventListener("click", function () {
    popupInfo.classList.add("active"), main.classList.add("active");
}),
    ExitBtn.addEventListener("click", function () {
        popupInfo.classList.remove("active"), main.classList.remove("active");
    }),
    continueBtn.addEventListener("click", function () {
        quizSection.classList.add("active"),
            popupInfo.classList.remove("active"),
            main.classList.remove("active"),
            quizBox.classList.add("active"),
            showQuestions(0),
            questionCounter(1),
            headerScore();
    }),
    tryAgainBtn.addEventListener("click", function () {
        quizBox.classList.add("active"),
            nextBtn.classList.remove("active"),
            resultBox.classList.remove("active"),
            (questionNum = 1),
            (userScore = 0),
            showQuestions((questionCount = 0)),
            questionCounter(questionNum),
            headerScore();
    }),
    goHomeBtn.addEventListener("click", function () {
        quizSection.classList.remove("active"),
            nextBtn.classList.remove("active"),
            resultBox.classList.remove("active"),
            (questionNum = 1),
            (userScore = 0),
            showQuestions((questionCount = 0)),
            questionCounter(questionNum);
    });
let questionCount = 0,
    questionNum = 1,
    userScore = 0;
var nextBtn = document.querySelector(".next-btn");

nextBtn.addEventListener("click", function () {

    if (questionCount < questions.length - 1) {
        showQuestions(++questionCount);
        questionCounter(++questionNum);
        nextBtn.classList.remove("active");
        selectedAnswer = null;
    } else {
        showResultBox();
    }

});


var optionList = document.querySelector(".option-list");
function showQuestions(e) {
    let t = document.querySelector(".question-text");
    t.textContent = `${questions[e].numb}. ${questions[e].question}`;
    let o = `<div class="option"><span>${questions[e].options[0]}</span></div>
     <div class="option"><span>${questions[e].options[1]}</span></div>
     <div class="option"><span>${questions[e].options[2]}</span></div>`;
    optionList.innerHTML = o;
    let n = document.querySelectorAll(".option");
    for (var i = 0; i < n.length; i++) n[i].setAttribute("onclick", "optionSelected(this)");
}
var selectedAnswer = null; 

function optionSelected(e) {
    selectedAnswer = e.textContent; 

    var correct = questions[questionCount].answer;
    var n = optionList.children.length;

    if (selectedAnswer == correct) {
        e.classList.add("correct");
        userScore += 1;
        headerScore();
    } else {
        e.classList.add("incorrect");
        for (var i = 0; i < n; i++) {
            if (optionList.children[i].textContent == correct) {
                optionList.children[i].setAttribute("class", "option correct");
            }
        }
    }

    for (var i = 0; i < n; i++) {
        optionList.children[i].classList.add("disabled");
    }
    nextBtn.classList.add("active");
}

function questionCounter(e) {
    let t = document.querySelector(".question-total");
    t.textContent = `${e} of ${questions.length} Questions`;
}
function headerScore() {
    document.querySelector(".header-score").textContent = `Score: ${userScore} / ${questions.length}`;
}
function showResultBox() {
    quizBox.classList.remove("active"),
        resultBox.classList.add("active"),
        (document.querySelector(".score-text").textContent = `Your Score ${userScore} out of ${questions.length}`);
    var e = document.querySelector(".circular-progress"),
        t = document.querySelector(".progress-value");
    let o = 0,
        n = Math.round((userScore / questions.length) * 100);
    (t.textContent = `${o}%`),
        (e.style.background = `conic-gradient(#36557e ${3.6 * o}deg, rgba(255, 255, 255, .1) ${3.6 * o}deg)`);
    let i = setInterval(() => {
        if (o >= n) {
            clearInterval(i);
            return;
        }
        o++, (t.textContent = `${o}%`);
        let s = 3.6 * o;
        e.style.background = `conic-gradient(#36557e ${s}deg, rgba(255, 255, 255, .1) ${s}deg)`;
    }, 20);
}
