let questions = [
  { exp: "2 + 3 × 4", correct: "multiply", steps: ["2 + 12", "14"] },
  { exp: "10 - 2 × 3", correct: "multiply", steps: ["10 - 6", "4"] },
  { exp: "6 + 8 ÷ 2", correct: "divide", steps: ["6 + 4", "10"] },
  { exp: "12 ÷ 3 + 2", correct: "divide", steps: ["4 + 2", "6"] },
  { exp: "5 + 6 × 2", correct: "multiply", steps: ["5 + 12", "17"] },
  { exp: "20 - 4 × 2", correct: "multiply", steps: ["20 - 8", "12"] },
  { exp: "18 ÷ 3 + 1", correct: "divide", steps: ["6 + 1", "7"] },
  { exp: "7 + 9 ÷ 3", correct: "divide", steps: ["7 + 3", "10"] },
  { exp: "15 - 5 × 2", correct: "multiply", steps: ["15 - 10", "5"] },
  { exp: "9 + 6 ÷ 3", correct: "divide", steps: ["9 + 2", "11"] }
];

let current = 0;
let step = 0;
let score = 0;
let time = 30;
let timer;

function loadQuestion() {
  let q = questions[current];
  document.getElementById("question").innerText = q.exp;
  document.getElementById("visual").innerText = "Follow BODMAS rule";
  document.getElementById("result").innerHTML = "";
  step = 0;
  startTimer();
}

function choose(choice) {
  let q = questions[current];

  if (step === 0) {
    if (choice === q.correct) {
      document.getElementById("result").innerHTML =
        '<i class="fa-solid fa-circle-check" style="color:rgb(32,195,52)"></i> Correct';

      document.getElementById("question").innerText = q.steps[0];
      document.getElementById("visual").innerText = "Next step";

      document.getElementById("correctSound").play();
      score++;
      step = 1;
    } else {
      document.getElementById("result").innerHTML =
        '<i class="fa-solid fa-circle-xmark" style="color:rgb(232,41,23)"></i> Wrong';

      document.getElementById("wrongSound").play();
    }
  } else {
    document.getElementById("result").innerText = "Answer = " + q.steps[1];
    score++;
    saveScore();
    nextQuestion();
  }

  document.getElementById("score").innerText = score;
}

function nextQuestion() {
  current++;
  if (current >= questions.length) {
    endGame();
    return;
  }
  document.getElementById("level").innerText = current + 1;
  loadQuestion();
}

function prevQuestion() {
  if (current > 0) {
    current--;
    document.getElementById("level").innerText = current + 1;
    loadQuestion();
  }
}

function restartGame() {
  current = 0;
  score = 0;

  document.getElementById("level").innerText = 1;
  document.getElementById("score").innerText = 0;

  document.getElementById("popup").classList.add("hidden");

  loadQuestion();
}

function startTimer() {
  clearInterval(timer);
  time = 30;
  document.getElementById("timer").innerText = time;

  timer = setInterval(() => {
    time--;
    document.getElementById("timer").innerText = time;
    if (time <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function endGame() {
  let percent = (score / 20) * 100;
  let text = "";

  if (score === 20) {
    text = "Excellent";

    let winAudio = document.getElementById("winSound");
    winAudio.currentTime = 0;
    winAudio.play();

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

  } else if (percent >= 70) {
    text = "Good";
  } else if (percent >= 50) {
    text = "Average";
  } else {
    text = "Fail";
  }

  document.getElementById("finalText").innerText =
    "Score: " + score + " | " + text;

  document.getElementById("popup").classList.remove("hidden");
}

function saveScore() {
  fetch("save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "score=" + score
  }).then(loadLeaderboard);
}

function loadLeaderboard() {
  fetch("get_scores.php")
    .then(res => res.text())
    .then(data => {
      document.getElementById("leaderboard").innerHTML = data;
    });
}

function toggleLeaderboard(){
  let panel = document.getElementById("leaderboardPanel");
  panel.classList.toggle("show");
}

// CLOSE WHEN CLICK OUTSIDE
document.addEventListener("click", function(e){
  let panel = document.getElementById("leaderboardPanel");
  let btn = document.querySelector(".btn-grad");

  if (!panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove("show");
  }
});

loadQuestion();
loadLeaderboard();