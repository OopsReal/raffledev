const socket = io();

let names = ["John", "Jane", "Alice", "Bob", "Eve"]; // Initialize with default names
let raffleInterval;
var isSlowingDown;
var counter;
var randomDelay;
var currentIndex;
var previousIndex;

var namesElement = document.getElementById("names");

var audioElement = new Audio('assets/raffle/fastbeep4.mp3');
var audioElement2 = new Audio('assets/raffle/slowbeep.mp3');
var winAudio = new Audio('assets/raffle/win.mp3');
var suspenseAudio = new Audio('assets/raffle/suspense.mp3');

socket.on("startraffle", (usernames) => {

  if(usernames) {
    names = usernames;
  }else{
    names = ["@Ashley", "@Bill", "@Mark", "@stephcurry", "@cutegirl"]; // Update names with the received usernames
  }
  playRaffle();

});


socket.on("stopraffle", () => {
stopRaffle();
});

function playRaffle() {
  resetRaffle();
  isSlowingDown = false;
  counter = 250;
  randomDelay = Math.floor(Math.random() * (6000 - 5000 + 1) + 5000)
  raffleInterval = setInterval(rotateNames, 150);
  suspenseAudio.play();
}

function rotateNames() {


  do {
    currentIndex = Math.floor(Math.random() * names.length);
  } while (currentIndex == previousIndex);

  namesElement.textContent = names[currentIndex];
  
  
  if (isSlowingDown) {
    audioElement2.pause();
  audioElement2.currentTime = 0;
  audioElement2.play();
 }else{
  audioElement.pause();
  audioElement.currentTime = 0;
  audioElement.play();  
 }

  previousIndex = currentIndex;

  if (isSlowingDown) {
    clearInterval(raffleInterval);
    raffleInterval = setInterval(rotateNames, counter)
    randomDelay -= counter;
    counter += 50;
    if (randomDelay <= 0) {
      clearInterval(raffleInterval);
      setTimeout(function() {
      let bg = `background: radial-gradient(circle, rgb(3, 118, 3) 0%, rgb(0, 0, 0) 100%);`
      document.body.style = bg;
      suspenseAudio.pause();
      suspenseAudio.currentTime = 0;
      winAudio.play();
    },1000)
    }
  }
}

function stopRaffle() {
  isSlowingDown = true;
}

function resetRaffle() {
  document.body.style = '';
}

