// Python Backend API URL (update if needed)
const API_BASE_URL = 'http://localhost:5000/api/quiz';

let currentStep = 'questions'; // 'questions' or 'result'
let currentQuestionIndex = 0;
let questionsList = [];
let userAnswers = [];

// Check if backend is running
async function checkBackendStatus() {
    const statusDiv = document.getElementById('apiStatus');
    try {
        const response = await fetch(`${API_BASE_URL}/questions`);
        if (response.ok) {
            statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> ✅ Python Backend Connected (Flask)';
            statusDiv.style.color = '#4CAF50';
            return true;
        }
    } catch (error) {
        statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ⚠️ Python Backend not running! Run: cd backend && python app.py';
        statusDiv.style.color = '#ff6b6b';
        console.error('Backend connection failed:', error);
        return false;
    }
}

// Fetch questions from Python backend
async function loadQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/questions`);
        const data = await response.json();
        if (data.success) {
            questionsList = data.questions;
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading questions:', error);
        return false;
    }
}

// Submit answers to Python backend
async function submitToBackend(answers) {
    try {
        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: answers })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Submission error:', error);
        return { success: false, error: error.message };
    }
}

// Console-style endpoint (Python logic)
async function submitConsoleStyle(answers) {
    try {
        const response = await fetch(`${API_BASE_URL}/console`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: answers })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Console endpoint error:', error);
        return { success: false, error: error.message };
    }
}

// Render current question
function renderQuestion() {
    const quizContent = document.getElementById('quizContent');
    if (currentQuestionIndex < questionsList.length) {
        quizContent.innerHTML = `
            <div class="question-counter">
                <i class="fas fa-code"></i> Question ${currentQuestionIndex + 1}/${questionsList.length}
            </div>
            <div class="question-text">
                <i class="fas fa-question-circle" style="color: #4169E1"></i>
                ${questionsList[currentQuestionIndex]}
            </div>
            <div class="answer-buttons">
                <button class="answer-btn yes-btn" onclick="handleAnswer('yes')">
                    <i class="fas fa-check"></i> YES
                </button>
                <button class="answer-btn no-btn" onclick="handleAnswer('no')">
                    <i class="fas fa-times"></i> NO
                </button>
            </div>
            <div class="console-hint" style="margin-top: 20px; font-size: 0.8rem; color: #666; font-family: monospace;">
                <i class="fas fa-terminal"></i> Python backend processing your answers...
            </div>
        `;
    }
}

// Handle user answer
async function handleAnswer(answer) {
    const value = answer === 'yes' ? 1 : 0;
    userAnswers.push(answer); // Store as 'yes'/'no' for Python console endpoint
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questionsList.length) {
        renderQuestion();
    } else {
        // All questions answered - call Python backend
        await showResult();
    }
}

// Show result from Python backend
async function showResult() {
    const quizContent = document.getElementById('quizContent');
    quizContent.innerHTML = `
        <div class="loading-console">
            <i class="fas fa-cogs fa-spin"></i> Running Python logic...
            <div style="margin-top: 10px; font-size: 0.9rem;">Executing calculate_score() function</div>
        </div>
    `;
    
    // Call Python backend
    const result = await submitConsoleStyle(userAnswers);
    
    if (result.success) {
        // Get character details from our local mapping (or backend could provide)
        const characterMap = {
            "Iron Man": { icon: "fa-robot", desc: "You're a genius, billionaire, playboy, philanthropist! Like Tony Stark, you rely on your intelligence, logic, and wit. You prefer working with technology and solving problems through innovation!", color: "#E62429" },
            "Hulk": { icon: "fa-fist-raised", desc: "SMASH! You're the Hulk - driven by emotion and raw power. When things get tough, you let your feelings guide you. You're not afraid to show aggression when needed!", color: "#4CAF50" },
            "Batman": { icon: "fa-moon", desc: "You're the Dark Knight! Brooding, strategic, and always prepared. Like Batman, you work alone, use logic over emotions, and fight for justice in the shadows!", color: "#1a1a1a" }
        };
        
        const charInfo = characterMap[result.character] || characterMap["Batman"];
        
        quizContent.innerHTML = `
            <div class="result-icon" style="color: ${charInfo.color}">
                <i class="fas ${charInfo.icon}"></i>
            </div>
            <div class="result-title" style="color: ${charInfo.color}">
                🐍 Python Says: You are ${result.character}!
            </div>
            <div class="console-output">
                <i class="fas fa-terminal"></i> $ python quiz.py<br>
                >>> Calculating score...<br>
                >>> Best match: ${result.character}<br>
                >>> Score: ${result.score}/3<br>
                <hr style="border-color: #333; margin: 10px 0;">
                ${charInfo.desc}
            </div>
            <div style="margin-top: 20px; padding: 10px; background: #1a1a1a; border-radius: 8px;">
                <small><i class="fas fa-code"></i> Python logic executed:</small>
                <pre style="background: #0a0a0a; padding: 8px; border-radius: 5px; margin-top: 8px; font-size: 0.7rem; overflow-x: auto;">
def calculate_score(user, character):
    score = 0
    for i in range(len(user)):
        if user[i] == character[i]:
            score += 1
    return score
# Your answers: ${userAnswers.join(', ')} → Result: ${result.character}</pre>
            </div>
            <button class="restart-btn" onclick="restartQuiz()">
                <i class="fas fa-redo"></i> Take Quiz Again
            </button>
        `;
    } else {
        quizContent.innerHTML = `
            <div style="color: #ff6b6b; text-align: center;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem;"></i>
                <h3>Python Backend Error</h3>
                <p>${result.error || 'Could not connect to Python server'}</p>
                <button class="restart-btn" onclick="restartQuiz()">
                    <i class="fas fa-sync"></i> Retry
                </button>
                <div style="margin-top: 20px; background: #1a1a1a; padding: 15px; border-radius: 8px; text-align: left;">
                    <strong>🔧 To fix this:</strong><br>
                    1. Open terminal in the 'backend' folder<br>
                    2. Run: <code style="background: #000; padding: 2px 6px;">pip install flask flask-cors</code><br>
                    3. Run: <code style="background: #000; padding: 2px 6px;">python app.py</code><br>
                    4. Refresh this page
                </div>
            </div>
        `;
    }
}

// Restart quiz
async function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    const backendOk = await checkBackendStatus();
    if (backendOk) {
        await loadQuestions();
        renderQuestion();
    } else {
        const quizContent = document.getElementById('quizContent');
        quizContent.innerHTML = `
            <div class="error-console">
                <i class="fas fa-plug"></i> Please start Python backend first<br>
                <code>cd backend && python app.py</code>
            </div>
        `;
    }
}

// Initialize quiz
async function initQuiz() {
    const backendRunning = await checkBackendStatus();
    if (backendRunning) {
        const loaded = await loadQuestions();
        if (loaded) {
            renderQuestion();
        } else {
            document.getElementById('quizContent').innerHTML = `
                <div style="color: #ff6b6b; text-align: center;">
                    Failed to load questions from Python backend.
                </div>
            `;
        }
    } else {
        document.getElementById('quizContent').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-python" style="font-size: 4rem; color: #4169E1;"></i>
                <h3>Python Backend Required</h3>
                <p>This quiz uses your original Python logic!</p>
                <div style="background: #1a1a1a; padding: 20px; border-radius: 10px; text-align: left; margin-top: 20px;">
                    <strong>📦 Installation:</strong><br>
                    <code>pip install flask flask-cors</code><br><br>
                    <strong>🚀 Run server:</strong><br>
                    <code>cd backend && python app.py</code><br><br>
                    <strong>📝 Your Python code is running in:</strong><br>
                    <pre style="background: #0a0a0a; padding: 10px;">${escapeHtml(`question = ["Do you like working alone?", ...]
# Your exact Python logic is preserved!`)}</pre>
                </div>
                <button onclick="location.reload()" style="margin-top: 20px; background: #4169E1; padding: 10px 20px; border: none; border-radius: 5px; color: white; cursor: pointer;">
                    Retry Connection
                </button>
            </div>
        `;
    }
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Make functions global
window.handleAnswer = handleAnswer;
window.restartQuiz = restartQuiz;

// Start the quiz
initQuiz();