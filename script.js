/* =============================================
   BODMAS QUEST — Game Engine
   ============================================= */

const questions = [
  {
    exp: "2 + 3 × 4",
    correct: "multiply",
    explain: "Multiplication comes before addition in BODMAS",
    steps: ["2 + 12", "14"],
    legend: ["M"]
  },
  {
    exp: "10 - 2 × 3",
    correct: "multiply",
    explain: "Multiplication has higher priority than subtraction",
    steps: ["10 - 6", "4"],
    legend: ["M"]
  },
  {
    exp: "6 + 8 ÷ 2",
    correct: "divide",
    explain: "Division is done before addition in BODMAS",
    steps: ["6 + 4", "10"],
    legend: ["D"]
  },
  {
    exp: "12 ÷ 3 + 2",
    correct: "divide",
    explain: "Division comes before addition",
    steps: ["4 + 2", "6"],
    legend: ["D"]
  },
  {
    exp: "5 + 6 × 2",
    correct: "multiply",
    explain: "Multiplication before addition",
    steps: ["5 + 12", "17"],
    legend: ["M"]
  },
  {
    exp: "20 ÷ 4 - 2",
    correct: "divide",
    explain: "Division is evaluated before subtraction",
    steps: ["5 - 2", "3"],
    legend: ["D"]
  },
  {
    exp: "3 + 4 × 2 - 1",
    correct: "multiply",
    explain: "Multiplication first, then left-to-right for + and −",
    steps: ["3 + 8 - 1", "10"],
    legend: ["M"]
  }
];

let current = 0;
let step = 0;
let score = 0;
let time = 30;
let timerInterval = null;
let mode = "learn";
let answered = false;

/* ─── MODE ─── */
function setMode(m) {
  mode = m;

  const learnBtn = document.getElementById("learnBtn");
  const playBtn  = document.getElementById("playBtn");
  const slider   = document.getElementById("modeSlider");

  if (m === "learn") {
    learnBtn.classList.add("active");
    playBtn.classList.remove("active");
    slider.classList.remove("play");
  } else {
    playBtn.classList.add("active");
    learnBtn.classList.remove("active");
    slider.classList.add("play");
  }

  loadQuestion();
}

/* ─── HIGHLIGHT ─── */
function highlightExpression(exp, type) {
  if (type === "multiply") {
    return exp.replace(/(\d+\s*×\s*\d+)/, "<span class='highlight'>$1</span>");
  }
  if (type === "divide") {
    return exp.replace(/(\d+\s*÷\s*\d+)/, "<span class='highlight'>$1</span>");
  }
  if (type === "add") {
    return exp.replace(/(\d+\s*\+\s*\d+)/, "<span class='highlight'>$1</span>");
  }
  if (type === "subtract") {
    return exp.replace(/(\d+\s*-\s*\d+)/, "<span class='highlight'>$1</span>");
  }
  return exp;
}

/* ─── LEGEND ─── */
function updateLegend(activeLetters) {
  document.querySelectorAll(".leg-item").forEach(el => {
    const letter = el.dataset.letter;
    el.classList.toggle("active", activeLetters.includes(letter));
  });
}

/* ─── LOAD QUESTION ─── */
function loadQuestion() {
  const q = questions[current];
  answered = false;

  document.getElementById("question").innerHTML = q.exp;
  setStepExplain("Identify which operation should be solved first.", "");
  document.getElementById("result").innerHTML = "";
  document.getElementById("level").innerText = current + 1;

  // card reset
  const card = document.getElementById("questionCard");
  card.classList.remove("correct-flash", "wrong-flash");

  // op buttons reset
  document.querySelectorAll(".op-btn").forEach(b => {
    b.style.opacity = "1";
    b.style.pointerEvents = "auto";
  });

  step = 0;
  updateLegend(q.legend || []);

  if (mode === "play") {
    startTimer(30);
  } else {
    stopTimer();
    updateTimerBar(100);
  }
}

/* ─── STEP EXPLAIN HELPER ─── */
function setStepExplain(html, state) {
  const el = document.getElementById("stepExplain");
  el.innerHTML = html;
  el.className = "step-explain";
  if (state === "correct") el.classList.add("is-correct");
  if (state === "wrong")   el.classList.add("is-wrong");
}

/* ─── CHOOSE ─── */
function choose(choice) {
  const q = questions[current];

  if (step === 0) {
    document.getElementById("question").innerHTML =
      highlightExpression(q.exp, q.correct);

    if (choice === q.correct) {
      playSound("correct");
      flashCard("correct");
      setStepExplain(`<i class="fa-solid fa-circle-check" style="color:#68d391;margin-right:6px;"></i>Correct! ` + q.explain, "correct");
      score++;
      document.getElementById("score").innerText = score;
      step = 1;

      // After a tick, show step 1
      setTimeout(() => {
        document.getElementById("question").innerText = q.steps[0];
        setStepExplain("Now choose the final operation to solve this step.", "");
      }, 900);

    } else {
      playSound("wrong");
      flashCard("wrong");
      setStepExplain(`<i class="fa-solid fa-circle-xmark" style="color:#fc8181;margin-right:6px;"></i>Wrong! ` + q.explain, "wrong");
    }

  } else if (step === 1) {
    let correctSecond = operatorInExpr(q.steps[0]);

    if (choice === correctSecond) {
      playSound("correct");
      flashCard("correct");
      setStepExplain(`<i class="fa-solid fa-bullseye" style="color:#f6ad55;margin-right:6px;"></i>Final Answer: <strong>` + q.steps[1] + `</strong>`, "correct");
      score++;
      document.getElementById("score").innerText = score;

      // Disable buttons briefly then advance
      lockButtons();
      saveScore();

      setTimeout(() => nextQuestion(), 1200);
    } else {
      playSound("wrong");
      flashCard("wrong");
      setStepExplain(
        `<i class="fa-solid fa-circle-xmark" style="color:#fc8181;margin-right:6px;"></i>Wrong! Try <strong>` + opLabel(correctSecond) + `</strong> next.`,
        "wrong"
      );
    }
  }
}

function operatorInExpr(expr) {
  if (expr.includes("×")) return "multiply";
  if (expr.includes("÷")) return "divide";
  if (expr.includes("+")) return "add";
  if (expr.includes("-")) return "subtract";
  return "add";
}

function opLabel(op) {
  const map = { multiply:"×  Multiply", divide:"÷  Divide", add:"+ Add", subtract:"− Subtract" };
  return map[op] || op;
}

/* ─── LOCK BUTTONS ─── */
function lockButtons() {
  document.querySelectorAll(".op-btn").forEach(b => {
    b.style.opacity = "0.4";
    b.style.pointerEvents = "none";
  });
}

/* ─── FLASH CARD ─── */
function flashCard(type) {
  const card = document.getElementById("questionCard");
  card.classList.remove("correct-flash", "wrong-flash");
  requestAnimationFrame(() => {
    card.classList.add(type === "correct" ? "correct-flash" : "wrong-flash");
    setTimeout(() => card.classList.remove("correct-flash", "wrong-flash"), 700);
  });
}

/* ─── NEXT / PREV ─── */
function nextQuestion() {
  current++;
  if (current >= questions.length) { endGame(); return; }
  loadQuestion();
}

function prevQuestion() {
  if (current > 0) { current--; loadQuestion(); }
}

/* ─── RESTART ─── */
function restartGame() {
  current = 0; score = 0; step = 0;
  document.getElementById("score").innerText = 0;
  document.getElementById("popup").classList.add("hidden");
  loadQuestion();
}

/* ─── TIMER ─── */
function startTimer(seconds) {
  stopTimer();
  time = seconds;
  updateTimerBar(100);
  document.getElementById("timer").innerText = time;
  document.querySelector(".timer-chip").classList.remove("urgent");
  document.querySelector(".timer-bar").classList.remove("urgent");

  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").innerText = time;
    updateTimerBar((time / seconds) * 100);

    if (time <= 8) {
      document.querySelector(".timer-chip").classList.add("urgent");
      document.querySelector(".timer-bar").classList.add("urgent");
    }
    if (time <= 0) { stopTimer(); nextQuestion(); }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.querySelector(".timer-chip").classList.remove("urgent");
  document.querySelector(".timer-bar").classList.remove("urgent");
}

function updateTimerBar(pct) {
  document.getElementById("timerBar").style.width = pct + "%";
}

/* ─── END GAME ─── */
function endGame() {
  stopTimer();
  const total = questions.length * 2;
  const pct = (score / total) * 100;

  let icon = `<i class="fa-solid fa-dumbbell" style="color:#68d391;"></i>`;
  let title = "Keep Practicing";
  if (pct === 100)    { icon = `<i class="fa-solid fa-trophy" style="color:#f6e05e;"></i>`;         title = "Perfect Score!"; }
  else if (pct >= 80) { icon = `<i class="fa-solid fa-star-shooting" style="color:#f6ad55;"></i>`; title = "Excellent!"; }
  else if (pct >= 60) { icon = `<i class="fa-solid fa-thumbs-up" style="color:#63b3ed;"></i>`;     title = "Well Done!"; }
  else if (pct >= 40) { icon = `<i class="fa-solid fa-face-smile" style="color:#9f7aea;"></i>`;    title = "Getting There!"; }

  document.getElementById("popupIcon").innerHTML = icon;
  document.getElementById("finalText").innerText = title;
  document.getElementById("popupScore").innerText = score + " / " + total + " pts";
  document.getElementById("popup").classList.remove("hidden");

  if (pct >= 80) {
    playSound("win");
    confetti({ particleCount: 220, spread: 120, origin: { y: 0.55 } });
  }
}

/* ─── SOUND ─── */
function playSound(type) {
  const map = { correct: "correctSound", wrong: "wrongSound", win: "winSound" };
  const el = document.getElementById(map[type]);
  if (!el) return;
  el.currentTime = 0;
  el.play().catch(() => {});
}

/* ─── SAVE SCORE ─── */
function saveScore() {
  fetch("save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "score=" + score
  }).then(loadLeaderboard).catch(() => {});
}

/* ─── LEADERBOARD ─── */
function loadLeaderboard() {
  fetch("get_scores.php")
    .then(res => res.text())
    .then(data => {
      document.getElementById("leaderboard").innerHTML = data;
    })
    .catch(() => {});
}

function toggleLeaderboard() {
  const panel   = document.getElementById("leaderboardPanel");
  const overlay = document.getElementById("lbOverlay");
  panel.classList.toggle("show");
  overlay.classList.toggle("show");
  if (panel.classList.contains("show")) loadLeaderboard();
}

/* ─── INIT ─── */
loadQuestion();
loadLeaderboard();