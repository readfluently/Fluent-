let words = document.querySelectorAll(".word")
let index = 0
let encourageTimer
let readTimer

function speak(text){

let speech = new SpeechSynthesisUtterance(text)

speech.rate = 0.8
speech.pitch = 1

speechSynthesis.speak(speech)

}

function encourage(){

speak("Try the word. You can do it.")

}

function startReading(){

index = 0
highlightWord()

}

function highlightWord(){

words.forEach(w=>w.classList.remove("active"))

if(index >= words.length) return

words[index].classList.add("active")

clearTimeout(encourageTimer)
clearTimeout(readTimer)

encourageTimer = setTimeout(encourage,5000)

readTimer = setTimeout(()=>{

let word = words[index].innerText
speak(word)

},8000)

}

words.forEach((word,i)=>{

word.addEventListener("click",()=>{

index = i+1
highlightWord()

})

})

document.getElementById("start").onclick = startReading
