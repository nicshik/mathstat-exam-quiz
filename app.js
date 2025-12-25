// =====================================
// CONFIGURATION & STATE
// =====================================
let quizData = {};
let currentTask = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // { taskId: [{ questionId, userChoice, correct, question, options }] }
let currentTaskAnswers = [];
let shuffledOptionsMap = {}; // Track original -> shuffled index mapping

// =====================================
// UTILITY: SHUFFLE ARRAY (Fisher-Yates)
// =====================================
function shuffleArray(array) {
    const shuffled = [...array]; // Copy
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// =====================================
// UTILITY: CREATE INDEX MAPPING
// =====================================
function createIndexMapping(originalArray, shuffledArray) {
    // Map: original_index -> shuffled_index
    // Used to track where the correct answer ended up
    const mapping = {};
    
    originalArray.forEach((item, origIdx) => {
        const newIdx = shuffledArray.indexOf(item);
        mapping[origIdx] = newIdx;
    });
    
    return mapping;
}

// =====================================
// INITIALIZATION
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    loadQuizData();
    attachStartButtons();
});

async function loadQuizData() {
    try {
        const response = await fetch('./quizData.json');
        quizData = await response.json();
        console.log('Quiz data loaded:', Object.keys(quizData).length, 'tasks');
    } catch (error) {
        console.error('Failed to load quiz data:', error);
        alert('Ошибка загрузки данных. Проверьте quizData.json');
    }
}

function attachStartButtons() {
    const startButtons = document.querySelectorAll('.start-btn');
    startButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskCard = e.target.closest('.task-card');
            const taskId = taskCard.dataset.task;
            startQuiz(taskId);
        });
    });
}

// =====================================
// QUIZ FLOW
// =====================================
function startQuiz(taskId) {
    currentTask = taskId;
    currentQuestionIndex = 0;
    currentTaskAnswers = [];
    shuffledOptionsMap = {}; // Reset for new quiz

    // Hide tasks grid, show quiz container
    document.querySelector('.tasks-grid').style.display = 'none';
    document.querySelector('.subtitle').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    showQuestion();
}

function showQuestion() {
    const questions = quizData[currentTask];
    if (!questions || currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const question = questions[currentQuestionIndex];
    const totalQuestions = questions.length;
    const progress = ((currentQuestionIndex) / totalQuestions) * 100;

    // ===== SHUFFLE OPTIONS =====
    const originalOptions = question.options;
    const shuffledOptions = shuffleArray(originalOptions);
    const indexMapping = createIndexMapping(originalOptions, shuffledOptions);
    
    // Store mapping for this question (key: question ID)
    shuffledOptionsMap[question.id] = {
        originalCorrect: question.correct,
        mapping: indexMapping,
        shuffledCorrect: indexMapping[question.correct] // Where correct answer ended up
    };
    // ===== END SHUFFLE =====

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-card">
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>

            <div class="question-header">
                <span>Задача ${currentTask} — Вопрос ${currentQuestionIndex + 1} из ${totalQuestions}</span>
                <span>ID: ${question.id}</span>
            </div>

            <h3>${question.text}</h3>

            <div class="options">
                ${shuffledOptions.map((opt, idx) => `
                    <button class="option-btn" data-index="${idx}">
                        ${String.fromCharCode(65 + idx)}. ${opt}
                    </button>
                `).join('')}
            </div>

            <div class="navigation-buttons">
                ${currentQuestionIndex > 0 ? '<button class="nav-btn prev-btn">← Назад</button>' : ''}
            </div>
        </div>
    `;

    // Attach option click handlers
    const optionBtns = quizContainer.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(btn, question, shuffledOptions));
    });

    // Attach prev button
    const prevBtn = quizContainer.querySelector('.prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentQuestionIndex--;
            showQuestion();
        });
    }
}

function handleAnswer(btn, question, shuffledOptions) {
    const selectedIndex = parseInt(btn.dataset.index); // Index in SHUFFLED array
    const questionMeta = shuffledOptionsMap[question.id];
    const correctShuffledIndex = questionMeta.shuffledCorrect;
    const isCorrect = selectedIndex === correctShuffledIndex;

    // Save answer (using shuffled option text)
    currentTaskAnswers[currentQuestionIndex] = {
        questionId: question.id,
        questionText: question.text,
        userChoice: selectedIndex, // Position in shuffled display
        correctChoice: correctShuffledIndex, // Position in shuffled display
        isCorrect: isCorrect,
        options: shuffledOptions, // Display the shuffled options
        optionsOriginal: question.options, // Store original for reference
        explanation: question.explanation
    };

    // Disable all options
    const allOptions = document.querySelectorAll('.option-btn');
    allOptions.forEach(opt => opt.disabled = true);

    // Highlight correct/incorrect
    btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
        allOptions[correctShuffledIndex].classList.add('correct');
    }

    // Show explanation
    const card = document.querySelector('.question-card');
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    
    // Build explanation text with reference to original positions
    const userChoiceOriginal = Object.keys(questionMeta.mapping).find(
        k => questionMeta.mapping[k] === selectedIndex
    );
    const correctOriginal = questionMeta.originalCorrect;
    
    explanationDiv.innerHTML = `
        <div class="result-badge ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? '✓ Правильно!' : '✗ Неправильно'}
        </div>
        <strong>Объяснение:</strong> ${question.explanation}
    `;
    card.appendChild(explanationDiv);

    // Add next button
    const navButtons = card.querySelector('.navigation-buttons');
    const nextBtn = document.createElement('button');
    nextBtn.className = 'nav-btn next-btn';
    nextBtn.textContent = currentQuestionIndex < quizData[currentTask].length - 1 ? 'Далее →' : 'Завершить';
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        showQuestion();
    });
    navButtons.appendChild(nextBtn);
}

// =====================================
// RESULTS PAGE
// =====================================
function showResults() {
    userAnswers[currentTask] = currentTaskAnswers;

    const correctCount = currentTaskAnswers.filter(a => a.isCorrect).length;
    const totalCount = currentTaskAnswers.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-card results-card">
            <h2 style="text-align: center; color: #667eea; margin-bottom: 2rem;">
                Результаты — Задача ${currentTask}
            </h2>

            <div class="score-display">
                <div class="score-number">${correctCount} / ${totalCount}</div>
                <div class="score-percentage">${percentage}%</div>
            </div>

            <div class="results-breakdown">
                <h3 style="margin: 2rem 0 1rem 0; color: #333;">Детальный разбор:</h3>
                ${currentTaskAnswers.map((answer, idx) => `
                    <div class="result-item ${answer.isCorrect ? 'result-correct' : 'result-incorrect'}">
                        <div class="result-header">
                            <span class="result-number">Вопрос ${idx + 1}</span>
                            <span class="result-status">${answer.isCorrect ? '✓ Верно' : '✗ Ошибка'}</span>
                        </div>
                        <div class="result-question">${answer.questionText}</div>
                        <div class="result-answers">
                            <div class="result-answer-line">
                                <strong>Ваш ответ:</strong> 
                                <span class="${answer.isCorrect ? 'answer-correct' : 'answer-incorrect'}">
                                    ${String.fromCharCode(65 + answer.userChoice)}. ${answer.options[answer.userChoice]}
                                </span>
                            </div>
                            ${!answer.isCorrect ? `
                                <div class="result-answer-line">
                                    <strong>Правильный ответ:</strong> 
                                    <span class="answer-correct">
                                        ${String.fromCharCode(65 + answer.correctChoice)}. ${answer.options[answer.correctChoice]}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="result-explanation">${answer.explanation}</div>
                    </div>
                `).join('')}
            </div>

            <div class="results-buttons">
                <button class="nav-btn retry-btn">Пройти заново</button>
                <button class="nav-btn home-btn">Вернуться к задачам</button>
            </div>
        </div>
    `;

    // Attach buttons
    document.querySelector('.retry-btn').addEventListener('click', () => startQuiz(currentTask));
    document.querySelector('.home-btn').addEventListener('click', returnHome);
}

function returnHome() {
    document.querySelector('.tasks-grid').style.display = 'grid';
    document.querySelector('.subtitle').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('quiz-container').innerHTML = '';
}