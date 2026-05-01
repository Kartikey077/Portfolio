let questions = [];
let currentIndex = 0;
let userAnswers = [];

async function loadQuiz() {
    const quizContent = document.getElementById('quizContent');
    const apiStatus = document.getElementById('apiStatus');

    try {
        appendLine("> Connecting to Flask API...");

        const res = await fetch('http://localhost:5000/api/quiz/questions');
        const data = await res.json();

        questions = data.questions;

        apiStatus.innerHTML = "🟢 Connected";
        appendLine("> Connected successfully.\n");

        askQuestion();

    } catch (error) {
        appendLine("> ERROR: Backend not reachable.");
        apiStatus.innerHTML = "🔴 Not Connected";
    }
}

function appendLine(text) {
    const consoleDiv = document.getElementById('quizContent');
    consoleDiv.innerHTML += `<div>> ${text}</div>`;
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function askQuestion() {
    if (currentIndex >= questions.length) {
        finishQuiz();
        return;
    }

    appendLine(`Question ${currentIndex + 1}: ${questions[currentIndex]} (y/n)`);

    showInput();
}

function showInput() {
    const consoleDiv = document.getElementById('quizContent');

    const input = document.createElement("input");
    input.className = "terminal-input";
    input.placeholder = "type y or n...";
    consoleDiv.appendChild(input);

    input.focus();

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const value = input.value.toLowerCase();
            input.remove();

            if (value === "y" || value === "n") {
                appendLine(value);
                userAnswers.push(value === "y" ? 1 : 0);
                currentIndex++;
                askQuestion();
            } else {
                appendLine("Invalid input. Use y/n");
                showInput();
            }
        }
    });
}

async function finishQuiz() {
    appendLine("\n> Processing results...");

    try {
        const response = await fetch('http://localhost:5000/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: userAnswers })
        });

        const data = await response.json();

        appendLine(`\n> You are: ${data.character}`);
        appendLine(`> ${data.details.description}`);
        appendLine(`> Score: ${data.score}/${data.total_questions}`);

    } catch (error) {
        appendLine("> ERROR submitting quiz.");
    }
}

loadQuiz();