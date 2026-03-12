const words = document.querySelectorAll(".word");
const startButton = document.getElementById("start");

let index = 0;
let encourageTimer = null;
let readTimer = null;
let recognition = null;
let isReadingActive = false;

function speak(text) {
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .trim();
}

function clearTimers() {
  clearTimeout(encourageTimer);
  clearTimeout(readTimer);
}

function setTimers() {
  clearTimers();

  encourageTimer = setTimeout(() => {
    if (!isReadingActive) return;
    speak(`Try the word ${words[index].innerText}`);
  }, 5000);

  readTimer = setTimeout(() => {
    if (!isReadingActive) return;
    speak(words[index].innerText);
  }, 8000);
}

function highlightWord() {
  words.forEach((word) => word.classList.remove("active"));

  if (index >= words.length) {
    finishReading();
    return;
  }

  words[index].classList.add("active");
  setTimers();
}

function moveToNextWord() {
  index += 1;
  highlightWord();
}

function finishReading() {
  isReadingActive = false;
  clearTimers();

  words.forEach((word) => word.classList.remove("active"));
  speak("Well done. You finished the reading.");
  
  if (recognition) {
    recognition.stop();
  }
}

function setupRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    return null;
  }

  const sr = new SpeechRecognition();
  sr.continuous = true;
  sr.interimResults = true;
  sr.lang = "en-US";

  sr.onresult = (event) => {
    if (!isReadingActive || index >= words.length) return;

    let transcript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + " ";
    }

    const heardWords = transcript
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);

    const targetWord = normalizeWord(words[index].innerText);

    if (heardWords.includes(targetWord)) {
      moveToNextWord();
    }
  };

  sr.onerror = (event) => {
    console.log("Speech recognition error:", event.error);
  };

  sr.onend = () => {
    if (isReadingActive) {
      try {
        sr.start();
      } catch (error) {
        console.log("Recognition restart blocked:", error);
      }
    }
  };

  return sr;
}

function startReading() {
  if (!recognition) {
    recognition = setupRecognition();
  }

  if (!recognition) return;

  index = 0;
  isReadingActive = true;
  highlightWord();

  try {
    recognition.start();
  } catch (error) {
    console.log("Recognition already started:", error);
  }
}

startButton.addEventListener("click", startReading);
