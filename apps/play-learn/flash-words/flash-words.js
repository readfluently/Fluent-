const WORD_SETS = {
  easy: [
    "cat", "dog", "run", "jump", "play", "ball", "tree", "book", "milk", "home",
    "fish", "bird", "rain", "sun", "hat", "pen", "desk", "hand", "shoe", "cake"
  ],
  medium: [
    "come", "said", "with", "here", "want", "there", "little", "school", "friend", "water",
    "after", "under", "every", "green", "house", "happy", "people", "animal", "garden", "paper"
  ],
  hard: [
    "because", "another", "through", "different", "children", "remember", "morning", "important", "sentence", "language",
    "learning", "building", "question", "picture", "reading", "special", "vocabulary", "complete", "between", "without"
  ]
};

const startBtn = document.getElementById("startBtn");
const checkBtn = document.getElementById("checkBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const levelSelect = document.getElementById("levelSelect");
const flashTimeInput = document.getElementById("flashTime");
const blankTimeInput = document.getElementById("blankTime");

const flashWord = document.getElementById("flashWord");
const flashLabel = document.getElementById("flashLabel");
const countdownText = document.getElementById("countdownText");
const statusRound = document.getElementById("statusRound");
const statusMode = document.getElementById("statusMode");

const answerSection = document.getElementById("answerSection");
const answerGrid = document.getElementById("answerGrid");
const resultsSection = document.getElementById("resultsSection");
const scoreBox = document.getElementById("scoreBox");
const resultMessage = document.getElementById("resultMessage");
const wordReview = document.getElementById("wordReview");

let currentWords = [];
let countdownInterval = null;
let gameRunning = false;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWords(level, count = 5) {
  return shuffle(WORD_SETS[level]).slice(0, count);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clearCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdownText.textContent = "";
}

function startVisibleCountdown(seconds, labelPrefix) {
  clearCountdown();

  if (seconds <= 0) {
    countdownText.textContent = "";
    return;
  }

  let remaining = seconds;
  countdownText.textContent = `${labelPrefix} ${remaining}s`;

  countdownInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearCountdown();
      return;
    }
    countdownText.textContent = `${labelPrefix} ${remaining}s`;
  }, 1000);
}

function updateStatus(index, mode) {
  statusRound.textContent = `Words: ${index} / 5`;
  statusMode.textContent = `Mode: ${mode}`;
}

function buildAnswerInputs() {
  answerGrid.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const card = document.createElement("div");
    card.className = "answer-card";

    const head = document.createElement("div");
    head.className = "answer-head";

    const title = document.createElement("h3");
    title.textContent = `Word ${i + 1}`;

    const star = document.createElement("span");
    star.className = "star-mark";
    star.id = `star-${i}`;
    star.textContent = "⭐";

    head.appendChild(title);
    head.appendChild(star);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Type word ${i + 1}`;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.dataset.index = i;

    const feedback = document.createElement("div");
    feedback.className = "feedback";
    feedback.id = `feedback-${i}`;

    card.appendChild(head);
    card.appendChild(input);
    card.appendChild(feedback);
    answerGrid.appendChild(card);
  }
}

function resetGameUI() {
  clearCountdown();
  answerSection.style.display = "none";
  resultsSection.style.display = "none";
  answerGrid.innerHTML = "";
  wordReview.innerHTML = "";
  flashWord.textContent = "Ready?";
  flashWord.classList.remove("flash-hidden");
  flashLabel.textContent = "Press “Start Game” to begin.";
  updateStatus(0, "Waiting");
  checkBtn.disabled = true;
  startBtn.disabled = false;
  gameRunning = false;
}

async function runGame() {
  if (gameRunning) return;

  const flashSeconds = Number(flashTimeInput.value);
  const blankSeconds = Number(blankTimeInput.value);

  if (flashSeconds < 1 || flashSeconds > 5) {
    alert("Flash time must be between 1 and 5 seconds.");
    return;
  }

  if (blankSeconds < 0 || blankSeconds > 3) {
    alert("Pause time must be between 0 and 3 seconds.");
    return;
  }

  gameRunning = true;
  startBtn.disabled = true;
  checkBtn.disabled = true;
  answerSection.style.display = "none";
  resultsSection.style.display = "none";
  answerGrid.innerHTML = "";
  wordReview.innerHTML = "";

  currentWords = pickWords(levelSelect.value, 5);

  flashLabel.textContent = "Get ready...";
  flashWord.classList.remove("flash-hidden");
  flashWord.textContent = "3";
  updateStatus(0, "Starting");

  await sleep(700);
  flashWord.textContent = "2";
  await sleep(700);
  flashWord.textContent = "1";
  await sleep(700);

  for (let i = 0; i < currentWords.length; i++) {
    const wordNumber = i + 1;
    const word = currentWords[i];

    flashLabel.textContent = `Watch word ${wordNumber}`;
    flashWord.classList.remove("flash-hidden");
    flashWord.textContent = word;
    updateStatus(wordNumber, "Watching");
    startVisibleCountdown(flashSeconds, "Hides in");

    await sleep(flashSeconds * 1000);
    clearCountdown();

    flashWord.classList.add("flash-hidden");
    flashWord.textContent = "•";
    flashLabel.textContent = "Remember the word...";
    updateStatus(wordNumber, "Remembering");

    if (i < currentWords.length - 1 && blankSeconds > 0) {
      startVisibleCountdown(blankSeconds, "Next word in");
      await sleep(blankSeconds * 1000);
      clearCountdown();
    }
  }

  flashWord.classList.remove("flash-hidden");
  flashWord.textContent = "Type the words!";
  flashLabel.textContent = "Now type all 5 words in order.";
  updateStatus(5, "Answering");

  buildAnswerInputs();
  answerSection.style.display = "block";
  checkBtn.disabled = false;
  gameRunning = false;

  const firstInput = answerGrid.querySelector("input");
  if (firstInput) firstInput.focus();
}

function checkAnswers() {
  const inputs = answerGrid.querySelectorAll("input");
  if (!inputs.length) return;

  let score = 0;
  wordReview.innerHTML = "";

  inputs.forEach((input, index) => {
    const typed = input.value.trim().toLowerCase();
    const expected = currentWords[index].toLowerCase();
    const feedback = document.getElementById(`feedback-${index}`);
    const star = document.getElementById(`star-${index}`);
    const correct = typed === expected;

    if (correct) {
      score += 1;
      feedback.textContent = "Correct";
      feedback.className = "feedback correct";
      if (star) {
        star.classList.add("visible");
      }
    } else {
      feedback.textContent = `Correct word: ${currentWords[index]}`;
      feedback.className = "feedback incorrect";
      if (star) {
        star.classList.remove("visible");
      }
    }

    const row = document.createElement("div");
    row.className = "word-row";
    row.innerHTML = `
      <div><strong>#${index + 1}</strong></div>
      <div>
        <div><strong>Expected</strong></div>
        <div>${currentWords[index]}</div>
      </div>
      <div>
        <div><strong>Typed</strong></div>
        <div>${input.value.trim() || "—"}</div>
      </div>
      <div class="badge ${correct ? "badge-success" : "badge-error"}">
        ${correct ? "⭐ Correct" : "Try again"}
      </div>
    `;
    wordReview.appendChild(row);
  });

  resultsSection.style.display = "block";
  scoreBox.textContent = `Score: ${score} / 5`;

  if (score === 5) {
    resultMessage.textContent = "Excellent! You remembered all five words correctly.";
  } else if (score >= 3) {
    resultMessage.textContent = "Well done! You are building strong word recognition.";
  } else {
    resultMessage.textContent = "Good try. Play again and see if you can beat your score.";
  }
}

startBtn.addEventListener("click", runGame);
checkBtn.addEventListener("click", checkAnswers);
playAgainBtn.addEventListener("click", resetGameUI);

resetGameUI();
