// Self-executing function to avoid global scope pollution
(function() {
    'use strict';
    
    // Game state - all variables are now scoped to this function
    let questions = [];
    let currentIndex = 0;
    let userAnswers = [];
    let backendAvailable = false;
    let gameActive = true;
    let gameTimeouts = [];
    let gameIntervals = [];
    
    const API_BASE_URL = 'http://localhost:5000';
    
    // Helper function to register timeouts for cleanup
    function registerTimeout(timeout) {
        gameTimeouts.push(timeout);
        return timeout;
    }
    
    // Helper function to register intervals for cleanup
    function registerInterval(interval) {
        gameIntervals.push(interval);
        return interval;
    }
    
    // Cleanup function for this specific game instance
    function cleanup() {
        gameActive = false;
        
        // Clear all timeouts
        gameTimeouts.forEach(timeout => clearTimeout(timeout));
        gameTimeouts = [];
        
        // Clear all intervals
        gameIntervals.forEach(interval => clearInterval(interval));
        gameIntervals = [];
        
        // Remove any pending input handlers
        const inputs = document.querySelectorAll('.terminal-input');
        inputs.forEach(input => {
            if (input && input.parentNode) {
                const clone = input.cloneNode(true);
                input.parentNode.replaceChild(clone, input);
            }
        });
    }
    
    // Expose cleanup to main page
    window.cleanupGameResources = cleanup;
    
    function updateApiStatus(status, message) {
        const apiStatus = document.getElementById('apiStatus');
        if (!apiStatus || !gameActive) return;
        
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
        if (!gameActive) return;
        
        const consoleDiv = document.getElementById('quizContent');
        if (!consoleDiv) return;
        
        // Remove any existing input
        const existingInput = document.querySelector('.terminal-input');
        if (existingInput) existingInput.remove();
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "terminal-input";
        input.placeholder = "y/n...";
        consoleDiv.appendChild(input);
        input.focus();
        
        const handler = function(e) {
            if (!gameActive) return;
            
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
        };
        
        input.addEventListener("keydown", handler);
    }
    
    function askQuestion() {
        if (!gameActive) return;
        
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
        if (!gameActive) return;
        
        const details = data.details || {};
        appendToConsole("\n" + "=".repeat(50));
        appendToConsole(`🎉 <strong>YOUR PERSONALITY MATCH: ${data.character}</strong> 🎉`);
        appendToConsole("=".repeat(50));
        appendToConsole(`\n📖 ${details.description || `You matched with ${data.character}!`}`);
        appendToConsole(`\n📊 Score: ${data.score}/${data.total_questions}`);
        
        const resultDiv = document.getElementById('result');
        if (resultDiv && details) {
            resultDiv.innerHTML = `
                <div class="result-card" style="background: ${details.color || '#4169E1'};">
                    <i class="fas ${details.icon || 'fa-star'}" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <h3 style="margin: 10px 0;">You are ${data.character}!</h3>
                    <p>${details.description || 'Thanks for playing!'}</p>
                    <button onclick="window.resetQuiz()" class="play-again-btn">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                </div>
            `;
        }
    }
    
    function showSimulatedResult() {
        if (!gameActive) return;
        
        const sum = userAnswers.reduce((a, b) => a + b, 0);
        let character, description, color, icon;
        
        if (sum === 3) {
            character = "Iron Man";
            description = "You're a genius, billionaire, playboy, philanthropist! Like Tony Stark, you rely on your intelligence, logic, and wit.";
            color = "#E62429";
            icon = "fa-robot";
        } else if (sum === 0) {
            character = "Hulk";
            description = "SMASH! You're the Hulk - driven by emotion and raw power. When things get tough, you let your feelings guide you!";
            color = "#4CAF50";
            icon = "fa-fist-raised";
        } else {
            character = "Batman";
            description = "You're the Dark Knight! Brooding, strategic, and always prepared. Like Batman, you work alone and fight for justice!";
            color = "#1a1a1a";
            icon = "fa-moon";
        }
        
        appendToConsole("\n" + "=".repeat(50));
        appendToConsole(`🎉 <strong>YOUR PERSONALITY MATCH: ${character}</strong> 🎉`);
        appendToConsole("=".repeat(50));
        appendToConsole(`\n📖 ${description}`);
        appendToConsole(`\n📊 Score: ${sum}/${questions.length}`);
        
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="result-card" style="background: ${color};">
                    <i class="fas ${icon}" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <h3 style="margin: 10px 0;">You are ${character}!</h3>
                    <p>${description}</p>
                    <button onclick="window.resetQuiz()" class="play-again-btn">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                </div>
            `;
        }
    }
    
    async function finishQuiz() {
        if (!gameActive) return;
        
        appendToConsole("\n📊 Analyzing your answers...");
        appendToConsole(`Your answers: ${userAnswers.join(', ')}`);
        
        if (backendAvailable) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/quiz/submit`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ answers: userAnswers })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    showResult(data);
                } else {
                    throw new Error(data.error || "Unknown error");
                }
                
            } catch (error) {
                appendToConsole(`\n❌ Backend error: ${error.message}`);
                appendToConsole("> Showing simulated result instead...");
                showSimulatedResult();
            }
        } else {
            showSimulatedResult();
        }
    }
    
    async function loadQuiz() {
        if (!gameActive) return;
        
        const quizContent = document.getElementById('quizContent');
        const apiStatus = document.getElementById('apiStatus');
        
        if (!quizContent) return;
    
        try {
            appendToConsole("> Connecting to Flask API at " + API_BASE_URL + "...");
            
            const controller = new AbortController();
            const timeoutId = registerTimeout(setTimeout(() => controller.abort(), 5000));
            
            const response = await fetch(`${API_BASE_URL}/api/quiz/questions`, {
                method: 'GET',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!gameActive) return;
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.questions) {
                questions = data.questions;
                backendAvailable = true;
                updateApiStatus('connected', '✅ Connected to Python Backend');
                appendToConsole("> ✅ Connected successfully to Flask server!");
                appendToConsole(`> 📋 Loaded ${questions.length} questions\n`);
                askQuestion();
            } else {
                throw new Error("Invalid response format");
            }
    
        } catch (error) {
            if (!gameActive) return;
            
            console.error("Backend connection error:", error);
            backendAvailable = false;
            updateApiStatus('error', '⚠️ Backend Not Connected - Using Offline Mode');
            
            appendToConsole("> ⚠️ Cannot connect to Python backend!");
            appendToConsole(`> Error: ${error.message}`);
            appendToConsole("\n> 💡 To fix this:");
            appendToConsole("> 1. Open a NEW terminal in the 'backend' folder");
            appendToConsole("> 2. Run: pip install flask flask-cors");
            appendToConsole("> 3. Run: python app.py");
            appendToConsole("> 4. Look for 'Running on http://localhost:5000'");
            appendToConsole("> 5. Refresh this page");
            appendToConsole("\n> 🎮 Using offline mode for now...\n");
            
            questions = [
                "Do you like working alone?",
                "Are you aggressive?",
                "Do you prefer logic over emotions?"
            ];
            askQuestion();
        }
    }
    
    // Expose reset function globally
    window.resetQuiz = function() {
        if (!gameActive) return;
        
        currentIndex = 0;
        userAnswers = [];
        const resultDiv = document.getElementById('result');
        const quizContent = document.getElementById('quizContent');
        
        if (resultDiv) resultDiv.innerHTML = '';
        if (quizContent) quizContent.innerHTML = '<div class="loading-console"><i class="fas fa-spinner fa-pulse"></i> Reloading quiz...</div>';
        
        registerTimeout(setTimeout(() => {
            if (gameActive) loadQuiz();
        }, 100));
    };
    
    // Initialize the game
    function init() {
        console.log('Initializing Personality Quiz...');
        loadQuiz();
    }
    
    // Start the game when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export cleanup function to window
    window.cleanupGameResources = cleanup;
})(); // End of self-executing function