const words = [
"come",
"said",
"here",
"want",
"with",
"there",
"little"
];

let selectedWords = [];
let index = 0;

const display = document.getElementById("word-display");

function startGame(){

selectedWords = words.sort(()=>0.5-Math.random()).slice(0,5);

index = 0;

showNextWord();
}

function showNextWord(){

if(index >= selectedWords.length){

display.innerText = "Type the words!";
return;

}

display.innerText = selectedWords[index];

setTimeout(()=>{

display.innerText = "";

index++;

setTimeout(showNextWord,1000);

},2000);

}

function checkAnswers(){

let score = 0;

for(let i=1;i<=5;i++){

let input = document.getElementById("a"+i).value.toLowerCase();

if(input === selectedWords[i-1]){

score++;

}

}

document.getElementById("result").innerText =
"You scored " + score + " out of 5";

}

document.getElementById("startBtn").onclick = startGame;

document.getElementById("checkBtn").onclick = checkAnswers;
