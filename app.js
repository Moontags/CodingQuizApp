const quizProgress = document.getElementById("quizProgress");
const questionContainer = document.getElementById("questionContainer");
const answerContainer = document.getElementById("answerContainer");
const restartQuizBtn = document.getElementById("restartQuiz");
const scoreDisplay = document.getElementById("scoreDisplay");
const currentScoreSpan = document.getElementById("currentScore");
const maxScoreSpan = document.getElementById("maxScore");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;

const QUIZAPI_KEY = "sAejkOVlCGAmBMeUWaYM7AV9OpfHRdAjcTt8txxv"; 

function setBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}

function updateScoreDisplay() {
    currentScoreSpan.textContent = score;
    maxScoreSpan.textContent = questions.length;
}

async function fetchQuestions() {
  score = 0; 
  currentQuestionIndex = 0; 
  updateScoreDisplay(); 
  restartQuizBtn.style.display = 'none'; 
  answerContainer.innerHTML = ''; 
  questionContainer.innerHTML = '<p>Loading coding questions...</p>'; 
  quizProgress.innerHTML = ''; 

  try {
    const response = await fetch(`https://quizapi.io/api/v1/questions?apiKey=${QUIZAPI_KEY}&limit=10&category=Code&tags=javascript`);
    const data = await response.json();

    if (!response.ok || !data || data.length === 0) {
      console.error("API Error or no questions:", data);
      questionContainer.innerHTML = "<p>Failed to load coding questions. Please check your API key and connection.</p>";
    
      restartQuizBtn.style.display = 'block';
      return;
    }

    questions = data.map((q) => {
      let possibleAnswers = [];
      let correctAnswer = null;

      for (const key in q.answers) {
        if (q.answers[key] !== null) {
          possibleAnswers.push(q.answers[key]);
        }
      }

      for (const key in q.correct_answers) {
        if (q.correct_answers[key] === "true") {
          const answerKey = key.replace('_correct', '');
          correctAnswer = q.answers[answerKey];
          break;
        }
      }
      
      possibleAnswers.sort(() => Math.random() - 0.5);

      return {
        topic: q.category,
        question: q.question,
        possibleAnswers: possibleAnswers,
        correctAnswer: correctAnswer,
      };
    });

    updateScoreDisplay();
    handleQuestion(currentQuestionIndex);
   
  } catch (error) {
    console.error("Error fetching questions:", error);
    questionContainer.innerHTML = "<p>Error loading quiz. Check your internet connection or API key.</p>";
    restartQuizBtn.style.display = 'block'; 
  }
}

function handleQuestion(index) {
  if (questions.length === 0) {
    questionContainer.innerHTML = "<p>No questions loaded. Please restart the quiz.</p>";
    quizProgress.innerHTML = "";
    answerContainer.innerHTML = "";
    restartQuizBtn.style.display = 'block'; 
    return;
  }

 
  if (index >= questions.length) {
    questionContainer.innerHTML = `<h2>Quiz Finished!</h2><p>Your score: ${score} out of ${questions.length}.</p>`;
    answerContainer.innerHTML = ''; 
    quizProgress.innerHTML = ''; 
    restartQuizBtn.style.display = 'block'; 
    return;
  }


  quizProgress.innerHTML = "";
  questions.forEach((question, i) => {
    quizProgress.innerHTML += `<span class="${i <= index ? 'seen' : ''}"></span>`; 
  });


  const displayedQuestion = questions[index].question;
  questionContainer.innerHTML = `
    <p>${questions[index].topic}</p>
    <p>${displayedQuestion}</p>
  `;


  answerContainer.innerHTML = "";
  questions[index].possibleAnswers.forEach((answer) => {
    answerContainer.innerHTML += `<button>${answer}</button>`;
  });

  const answerButtons = document.querySelectorAll(".answer-container button");
  answerButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const clickedAnswerText = e.target.textContent;
      const correctAnswerText = questions[index].correctAnswer;

      answerButtons.forEach(btn => btn.disabled = true);

      if (clickedAnswerText === correctAnswerText) {
        e.target.classList.add('correct');
        score++;
        console.log("Correct! Score:", score);
      } else {
        e.target.classList.add('wrong');
        console.log("Wrong.");
        answerButtons.forEach(btn => {
          if (btn.textContent === correctAnswerText) {
            btn.classList.add('correct');
          }
        });
      }
      updateScoreDisplay();

      setTimeout(() => {
        currentQuestionIndex++;
        handleQuestion(currentQuestionIndex);
      }, 1200);
    });
  });
}

restartQuizBtn.addEventListener('click', fetchQuestions);

setBackgroundColor("var(--body-bg)");
fetchQuestions();

restartQuizBtn.style.display = 'none';