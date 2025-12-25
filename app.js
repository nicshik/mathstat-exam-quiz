// app.js - Модульный код для quiz приложения
let quizData = {};
let currentTask = null;
let currentQuestionIndex = 0;
let score = 0;
let answers = [];

// Загрузка данных при старте
async function loadQuizData() {
    try {
        const response = await fetch('./quizData.json');
        if (!response.ok) throw new Error('Failed to load quiz data');
        quizData = await response.json();
        console.log('Quiz data loaded:', Object.keys(quizData).length, 'tasks');
    } catch (error) {
        console.error('Error loading quiz data:', error);
        document.body.innerHTML = '<div style="color:red;padding:20px;">Ошибка загрузки данных. Проверьте консоль.</div>';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuizData();
    setupEventListeners();
});

// Установка обработчиков событий
function setupEventListeners() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        const taskNum = card.getAttribute('data-task');
        const button = card.querySelector('.start-btn');
        if (button) {
            button.addEventListener('click', () => startQuiz(taskNum));
        }
    });
}

// Запуск квиза для задачи
function startQuiz(taskNumber) {
    currentTask = taskNumber;
    currentQuestionIndex = 0;
    score = 0;
    answers = [];

    if (!quizData[taskNumber] || quizData[taskNumber].length === 0) {
        alert('Вопросы для этой задачи пока недоступны.');
        return;
    }

    document.querySelector('.container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    showQuestion();
}

// Показать текущий вопрос
function showQuestion() {
    const questions = quizData[currentTask];
    const question = questions[currentQuestionIndex];

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-card">
            <div class="question-header">
                <span>Задача ${currentTask}</span>
                <span>Вопрос ${currentQuestionIndex + 1} из ${questions.length}</span>
            </div>
            <h3>${question.text}</h3>
            <div class="options">
                ${question.options.map((opt, i) => `
                    <button class="option-btn" onclick="selectAnswer(${i})">${opt}</button>
                `).join('')}
            </div>
            <button class="nav-btn" onclick="goBack()">Вернуться к задачам</button>
        </div>
    `;
}

// Выбор ответа
function selectAnswer(optionIndex) {
    const questions = quizData[currentTask];
    const question = questions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correct;

    answers.push({
        questionId: question.id,
        selected: optionIndex,
        correct: question.correct,
        isCorrect: isCorrect
    });

    if (isCorrect) score++;

    // Показываем объяснение
    const quizContainer = document.getElementById('quiz-container');
    const resultClass = isCorrect ? 'correct' : 'incorrect';
    const resultText = isCorrect ? 'Правильно!' : 'Неправильно';

    quizContainer.innerHTML = `
        <div class="question-card">
            <div class="result-badge ${resultClass}">${resultText}</div>
            <h3>${question.text}</h3>
            <div class="explanation">
                <strong>Правильный ответ:</strong> ${question.options[question.correct]}
                <br><br>
                <strong>Объяснение:</strong> ${question.explanation}
            </div>
            <button class="nav-btn" onclick="nextQuestion()">
                ${currentQuestionIndex + 1 < questions.length ? 'Следующий вопрос' : 'Завершить'}
            </button>
        </div>
    `;
}

// Следующий вопрос
function nextQuestion() {
    const questions = quizData[currentTask];
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

// Показать результаты
function showResults() {
    const questions = quizData[currentTask];
    const percentage = Math.round((score / questions.length) * 100);

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div class="question-card">
            <h2>Результаты</h2>
            <div class="score-display">
                <div class="score-number">${score} из ${questions.length}</div>
                <div class="score-percentage">${percentage}%</div>
            </div>
            <button class="nav-btn" onclick="goBack()">Вернуться к задачам</button>
            <button class="nav-btn" onclick="startQuiz('${currentTask}')">Пройти заново</button>
        </div>
    `;
}

// Вернуться к списку задач
function goBack() {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    currentTask = null;
    currentQuestionIndex = 0;
}
