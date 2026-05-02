/**
 * Personality Quiz Game - Terminal Style
 */
(function() {
    'use strict';
    
    let questions = [];
    let currentIndex = 0;
    let userAnswers = [];
    let backendAvailable = false;
    let gameActive = true;
    let quizFinished = false;
    
    const API_BASE_URL = 'https://kartikey-rai-portfolio.onrender.com';
    
    function updateApiStatus(status, message) {
        const apiStatus = document.getElementById('apiStatus');
        if (!apiStatus) return;
        
        apiStatus.innerHTML = message;
        if (status === 'connected') {
            apiStatus.style.background = "#0a3d0a";
            apiStatus.style.color = "#0f0";
        } else if (status === 'error') {
            apiStatus.style.background = "#3d0a0a";
            apiStatus.style.color = "#ff6b6b";
        } else {
            apiStatus.style.background = "#3d3d0a";
            apiStatus.style.color = "#ffcc00";
        }
    }
    
    function appendToConsole(text) {
        const consoleDiv = document.getElementById('quizContent');
        if (!consoleDiv || !gameActive) return;
        
        const line = document.createElement('div');
        line.innerHTML = text;
        consoleDiv.appendChild(line);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
    
    function showInput() {
        if (!gameActive || quizFinished) return;
        
        const consoleDiv = document.getElementById('quizContent');
        if (!consoleDiv) return;
        
        const existingInput = document.querySelector('.terminal-input');
        if (existingInput) existingInput.remove();
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "terminal-input";
        input.placeholder = "type y or n...";
        consoleDiv.appendChild(input);
        input.focus();
        
        input.addEventListener("keydown", function handler(e) {
            if (e.key === "Enter") {
                const value = input.value.trim().toLowerCase();
                input.remove();
                
                if (value === "y" || value === "yes") {
                    appendToConsole("<span style='color: #0f0;'>✓ Your answer: YES</span>");
                    userAnswers.push(1);
                    currentIndex++;
                    askQuestion();
                } 
                else if (value === "n" || value === "no") {
                    appendToConsole("<span style='color: #ff6b6b;'>✗ Your answer: NO</span>");
                    userAnswers.push(0);
                    currentIndex++;
                    askQuestion();
                } 
                else {
                    appendToConsole("<span style='color: #ff6b6b;'>❌ Invalid input. Please enter 'y' or 'n'</span>");
                    showInput();
                }
            }
        });
    }
    
    function askQuestion() {
        if (!gameActive || quizFinished) return;
        
        if (currentIndex >= questions.length) {
            finishQuiz();
            return;
        }
    
        appendToConsole(`<br>📝 <strong>Question ${currentIndex + 1}/${questions.length}</strong>`);
        appendToConsole(`${questions[currentIndex]}`);
        appendToConsole(`<span style="color: #ffcc00;">Type 'y' for YES or 'n' for NO and press Enter:</span>`);
        showInput();
    }
    
    function showResult(data) {
        if (!gameActive || quizFinished) return;
        
        quizFinished = true;
        const details = data.details || {};
        
        // Console shows character and score
        appendToConsole("\n" + "=".repeat(50));
        appendToConsole(`🎉 <strong>YOUR PERSONALITY MATCH: ${data.character}</strong> 🎉`);
        appendToConsole("=".repeat(50));
        appendToConsole(`\n📖 ${details.description}`);
        appendToConsole(`\n📊 Score: ${data.score}/${data.total_questions}`);
        
        // Bottom card only shows Play Again button
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="text-align: center; margin-top: 20px; padding: 15px;">
                    <button onclick="window.resetQuiz()" class="play-again-btn">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                </div>
            `;
        }
    }
    
    function showSimulatedResult() {
        if (!gameActive || quizFinished) return;
        
        quizFinished = true;
        const sum = userAnswers.reduce((a, b) => a + b, 0);
        let character, description, color;
        
        if (sum === 3) {
            character = "Iron Man";
            description = "You're a genius, billionaire, playboy, philanthropist! Like Tony Stark, you rely on your intelligence, logic, and wit.";
            color = "#E62429";
        } else if (sum === 0) {
            character = "Hulk";
            description = "SMASH! You're the Hulk - driven by emotion and raw power. When things get tough, you let your feelings guide you!";
            color = "#4CAF50";
        } else {
            character = "Batman";
            description = "You're the Dark Knight! Brooding, strategic, and always prepared. Like Batman, you work alone and fight for justice!";
            color = "#1a1a1a";
        }
        
        // Console shows character, description, and score
        appendToConsole("\n" + "=".repeat(50));
        appendToConsole(`🎉 <strong>YOUR PERSONALITY MATCH: ${character}</strong> 🎉`);
        appendToConsole("=".repeat(50));
        appendToConsole(`\n📖 ${description}`);
        appendToConsole(`\n📊 Score: ${sum}/${questions.length}`);
        
        // Bottom card only shows Play Again button
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="text-align: center; margin-top: 20px; padding: 15px;">
                    <button onclick="window.resetQuiz()" class="play-again-btn">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                </div>
            `;
        }
    }
    
    async function finishQuiz() {
        if (!gameActive || quizFinished) return;
        
        appendToConsole("\n📊 Analyzing your answers...");
        
        if (backendAvailable) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers: userAnswers })
                });
                
                const data = await response.json();
                if (data.success) {
                    showResult(data);
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                appendToConsole(`\n❌ Backend error, showing offline results...`);
                showSimulatedResult();
            }
        } else {
            showSimulatedResult();
        }
    }
    
    async function loadQuiz() {
        const quizContent = document.getElementById('quizContent');
        if (!quizContent) return;
        
        // Reset all flags
        quizFinished = false;
        currentIndex = 0;
        userAnswers = [];
        
        quizContent.innerHTML = '';
        
        try {
            appendToConsole("> Connecting to Flask API...");
            
            const response = await fetch(`${API_BASE_URL}/api/quiz/questions`);
            
            if (!response.ok) throw new Error('Backend not reachable');
            
            const data = await response.json();
            
            if (data.success && data.questions) {
                questions = data.questions;
                backendAvailable = true;
                updateApiStatus('connected', '✅ Connected to Python Backend');
                appendToConsole("> Connected successfully!\n");
                askQuestion();
            } else {
                throw new Error("Invalid response");
            }
    
        } catch (error) {
            backendAvailable = false;
            updateApiStatus('error', '⚠️ Offline Mode - Backend Not Connected');
            
            appendToConsole("> ⚠️ Backend not reachable, using offline mode\n");
            questions = [
                "Do you like working alone?",
                "Are you aggressive?",
                "Do you prefer logic over emotions?"
            ];
            askQuestion();
        }
    }
    
    window.resetQuiz = function() {
        // Reset all state
        quizFinished = false;
        currentIndex = 0;
        userAnswers = [];
        gameActive = true;
        
        // Clear displays
        const resultDiv = document.getElementById('result');
        const quizContent = document.getElementById('quizContent');
        
        if (resultDiv) resultDiv.innerHTML = '';
        if (quizContent) quizContent.innerHTML = '';
        
        // Reload quiz
        loadQuiz();
    };
    
    window.cleanupGameResources = function() {
        gameActive = false;
    };
    
    // Auto-start
    loadQuiz();
})();