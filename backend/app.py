from flask import Flask, jsonify, request, render_template_string
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Allow frontend to call backend

# Your Python quiz logic
questions = [
    "Do you like working alone?",
    "Are you aggressive?",
    "Do you prefer logic over emotions?"
]

characters = {
    "Iron Man": [1, 0, 1],
    "Hulk": [0, 1, 0],
    "Batman": [0, 0, 1]
}

character_descriptions = {
    "Iron Man": {
        "icon": "fa-robot",
        "description": "You're a genius, billionaire, playboy, philanthropist! Like Tony Stark, you rely on your intelligence, logic, and wit.",
        "color": "#E62429"
    },
    "Hulk": {
        "icon": "fa-fist-raised",
        "description": "SMASH! You're the Hulk - driven by emotion and raw power. When things get tough, you let your feelings guide you!",
        "color": "#4CAF50"
    },
    "Batman": {
        "icon": "fa-moon",
        "description": "You're the Dark Knight! Brooding, strategic, and always prepared. Like Batman, you work alone and fight for justice!",
        "color": "#1a1a1a"
    }
}

def calculate_score(user_answers, character_traits):
    """Calculate score between user answers and character traits"""
    score = 0
    for i in range(len(user_answers)):
        if user_answers[i] == character_traits[i]:
            score += 1
    return score

def find_best_match(user_answers):
    """Find best matching character based on user answers"""
    best_match = ""
    max_score = -1
    
    for character_name, traits in characters.items():
        score = calculate_score(user_answers, traits)
        if score > max_score:
            max_score = score
            best_match = character_name
    
    return best_match, max_score

@app.route('/api/quiz/questions', methods=['GET'])
def get_questions():
    """Return quiz questions"""
    return jsonify({
        'success': True,
        'questions': questions
    })

@app.route('/api/quiz/submit', methods=['POST'])
def submit_answers():
    """Process user answers and return result"""
    try:
        data = request.json
        user_answers = data.get('answers', [])
        
        # Convert yes/no to 1/0 if needed
        processed_answers = []
        for ans in user_answers:
            if ans in [1, 0]:
                processed_answers.append(ans)
            else:
                processed_answers.append(1 if str(ans).lower() == 'yes' else 0)
        
        best_match, score = find_best_match(processed_answers)
        
        return jsonify({
            'success': True,
            'character': best_match,
            'score': score,
            'total_questions': len(questions),
            'details': character_descriptions.get(best_match, {})
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/quiz/console', methods=['POST'])
def console_style_quiz():
    """Console-style quiz endpoint that returns text output"""
    try:
        data = request.json
        answers = data.get('answers', [])
        
        # Using your original Python logic
        user_answer = []
        for ans in answers:
            if ans == "yes" or ans == 1 or ans == "1":
                user_answer.append(1)
            else:
                user_answer.append(0)
        
        def calculate(user, char):
            score = 0
            for i in range(len(user)):
                if user[i] == char[i]:
                    score += 1
            return score
        
        best_match = ""
        max_score = -1
        
        for name, trait in characters.items():
            score = calculate(user_answer, trait)
            if score > max_score:
                max_score = score
                best_match = name
        
        return jsonify({
            'success': True,
            'result': f"You are: {best_match}",
            'character': best_match,
            'score': f"{max_score}/{len(questions)}"
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    print("🎮 Personality Quiz Backend Running!")
    print("📍 API:")
    print("   GET  /api/quiz/questions")
    print("   POST /api/quiz/submit")
    print("   POST /api/quiz/console")
    print("\n🚀 Server starting on http://localhost:5000")
    