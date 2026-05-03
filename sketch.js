let port;
let connectBtn;

let jolt = 0;

// Player physics
let xPos = 15;
let yPos = 15;
let velX = 0;
let velY = 0;

const r = 12; // player radius

let walls = [];
let holes = [];
let gameOver = false;
let gameWin = false;

let restartBtn;

// WIN ZONE
let winZone = { x: 20, y: 575, r: 15 };

// -----------------------------
// TIMER + HIGHSCORE
// -----------------------------
let startTime = 0;
let currentTime = 0;
let bestTime = null;

// -----------------------------
// SOUNDS
// -----------------------------
let failSound;
let winSound;
let arcadeMusic;

// -----------------------------
// PRELOAD SOUNDS
// -----------------------------
function preload() {
  failSound = loadSound("Fail.mp3");
  failSound.setVolume(15.0); // 1.0 is default, go higher to boost

  winSound = loadSound("Win.mp3");
  winSound.setVolume(15.0); // 1.0 is default, go higher to boost

  arcadeMusic = loadSound("Arcade.mp3");
  arcadeMusic.setVolume(0.5); // 1.0 is default, go higher to boost

}

function setup() {
  createCanvas(600, 600);
  rectMode(CENTER);

  // Load high score
  if (localStorage.getItem("bestTime")) {
    bestTime = float(localStorage.getItem("bestTime"));
  }

  // Serial setup
  port = createSerial();
  connectBtn = createButton("Connect to Arduino");
  connectBtn.mousePressed(connectBtnClick);

  let usedPorts = usedSerialPorts();
  if (usedPorts.length > 0) {
    port.open(usedPorts[0], 115200);
    connectBtn.html("Disconnect");
  }

  let sendBtn = createButton("Send hello");
  sendBtn.mousePressed(sendBtnClick);

  restartBtn = createButton("Restart");
  restartBtn.position(260, 450);
  restartBtn.mousePressed(restartGame);
  restartBtn.hide();

  buildMaze();
  buildHoles();

  // Start timer
  startTime = millis();

  // Start arcade music
  arcadeMusic.setLoop(true);
  arcadeMusic.play();
}

//   ------------------------------------------------------
//       DRAW FUNCTION
//   ------------------------------------------------------

function draw() {
  background(150, 101, 51);

  if (gameOver) {
    drawGameOver();
    return;
  }

  if (gameWin) {
    drawWinScreen();
    return;
  }

  // Update timer
  currentTime = (millis() - startTime) / 1000;

  drawMaze();
  drawHoles();
  drawWinZone();

  // Display timer
  fill(255);
  textSize(22);
  textAlign(LEFT, TOP);
  text("Time: " + currentTime.toFixed(2), 10, 10);

  if (bestTime !== null) {
    text("Best: " + bestTime.toFixed(2), 10, 40);
  }

  // ------------------------------------------------------
  // READ SERIAL
  // ------------------------------------------------------
  let str = port.readUntil("\n");

  if (str.length > 0) {
    str = split(str, ",");

    let rawX = float(str[1]);
    let rawY = float(str[0]);

    let accX = rawX * 1.1;
    let accY = rawY * 1.1;

    velX += accX;
    velY += accY;
  }

  // ------------------------------------------------------
  // PHYSICS
  // ------------------------------------------------------

  let nextX = xPos + velX;
  let blockedX = false;

  for (let w of walls) {
    if (circleLineCollide(nextX, yPos, r, w.x1, w.y1, w.x2, w.y2)) {
      blockedX = true;
      break;
    }
  }

  if (!blockedX) xPos = nextX;
  else velX = 0;

  let nextY = yPos + velY;
  let blockedY = false;

  for (let w of walls) {
    if (circleLineCollide(xPos, nextY, r, w.x1, w.y1, w.x2, w.y2)) {
      blockedY = true;
      break;
    }
  }

  if (!blockedY) yPos = nextY;
  else velY = 0;

  velX *= 0.9;
  velY *= 0.9;

  velX = constrain(velX, -2, 2);
  velY = constrain(velY, -2, 2);

  xPos = constrain(xPos, r, width - r);
  yPos = constrain(yPos, r, height - r);

  checkHoleCollision();
  checkWinCondition();

  fill(255, 220, 20);
  ellipse(xPos, yPos, 25, 25);
}

function connectBtnClick() {
  if (connectBtn.html() !== "Disconnect") {
    port.open("Arduino", 9600);
    connectBtn.html("Disconnect");
  } else {
    port.close();
    connectBtn.html("Connect to Arduino");
  }
}

function sendBtnClick() {
  port.println("Hello from p5.js");
}

// ------------------------------------------------------
// MAZE BUILDING
// ------------------------------------------------------

function buildMaze() {
  walls = [];

  function wall(x1, y1, x2, y2) {
    walls.push({ x1, y1, x2, y2 });
  }

  // Outer box
  wall(0, 0, 600, 0);
  wall(0, 0, 0, 600);
  wall(600, 600, 600, 0);
  wall(600, 600, 0, 600);

  // Maze walls
  wall(0, 35, 235, 35);
  wall(235, 35, 235, 100);
  wall(320, 0, 320, 140);
  wall(160, 140, 390, 140);
  wall(390, 140, 390, 190);
  wall(340, 190, 390, 190);
  wall(160, 80, 160, 140);
  wall(160, 80, 50, 80);
  wall(50, 480, 50, 80);
  wall(50, 480, 200, 480);
  wall(0, 550, 90, 550);
  wall(90, 550, 90, 520);
  wall(90, 520, 250, 520);
  wall(250, 520, 250, 440);
  wall(250, 440, 100, 440);
  wall(100, 440, 100, 150);
  wall(100, 180, 200, 180);
  wall(240, 140, 240, 225);
  wall(150, 225, 240, 225);
  wall(150, 225, 150, 370);
  wall(195, 440, 195, 280);
  wall(240, 225, 240, 370);
  wall(290, 190, 290, 520);
  wall(340, 190, 340, 450);
  wall(290, 520, 550, 520);
  wall(390, 400, 390, 520);
  wall(340, 340, 440, 340);
  wall(440, 470, 440, 340);
  wall(490, 520, 490, 280);
  wall(410, 280, 540, 280);
  wall(410, 280, 410, 250);
  wall(410, 250, 430, 250);
  wall(430, 250, 430, 90);
  wall(430, 90, 370, 90);
  wall(370, 90, 370, 35);
  wall(370, 35, 550, 35);
  wall(480, 80, 600, 80);
  wall(480, 80, 480, 210);
  wall(540, 130, 540, 280);
  wall(540, 330, 600, 330);
  wall(490, 410, 560, 410);
  wall(540, 460, 600, 460);
  wall(520, 600, 520, 570);
  wall(470, 520, 470, 560);
  wall(380, 600, 380, 570);
  wall(320, 520, 320, 560);
  wall(200, 600, 200, 570);
}

function drawMaze() {
  strokeWeight(3);
  for (let w of walls) {
    line(w.x1, w.y1, w.x2, w.y2);
  }
}

// ------------------------------------------------------
// HOLES WITH NUMBERS
// ------------------------------------------------------

function buildHoles() {
  holes = [
    { x: 298, y: 22, r: 18, num: 1 },
    { x: 213, y: 60, r: 18, num: 2 },
    { x: 22, y: 527, r: 18, num: 3 },
    { x: 71, y: 101, r: 18, num: 4 },
    { x: 121, y: 420, r: 18, num: 5 },
    { x: 215, y: 420, r: 18, num: 6 },
    { x: 270, y: 470, r: 18, num: 7 },
    { x: 365, y: 165, r: 18, num: 8 },
    { x: 368, y: 498, r: 18, num: 9 },
    { x: 360, y: 320, r: 18, num: 10 },
    { x: 450, y: 260, r: 18, num: 11 },
    { x: 510, y: 390, r: 18, num: 12 },
    { x: 580, y: 580, r: 18, num: 13 },
    { x: 402, y: 580, r: 18, num: 14 },
    { x: 222, y: 580, r: 18, num: 15 },
    { x: 140, y: 580, r: 18, num: 16 },
  ];
}

function drawHoles() {
  textAlign(CENTER, CENTER);
  textSize(16);

  for (let h of holes) {
    fill(0);
    ellipse(h.x, h.y, h.r * 2);

    fill(255);
    text(h.num, h.x, h.y);
  }
}

function checkHoleCollision() {
  for (let h of holes) {
    let dx = xPos - h.x;
    let dy = yPos - h.y;
    let distSq = dx * dx + dy * dy;
    let rad = r + h.r;

    if (distSq < rad * rad) {
      if (!gameOver) failSound.play(); // PLAY FAIL SOUND
      gameOver = true;
      restartBtn.show();
      return;
    }
  }
}

// ------------------------------------------------------
// WIN CONDITION
// ------------------------------------------------------

function drawWinZone() {
  fill(0, 255, 0);
  ellipse(winZone.x, winZone.y, winZone.r * 2, winZone.r * 2);
}

function checkWinCondition() {
  let dx = xPos - winZone.x;
  let dy = yPos - winZone.y;
  let distSq = dx * dx + dy * dy;

  if (distSq < (r + winZone.r) ** 2) {

    if (!gameWin) winSound.play(); // PLAY WIN SOUND

    gameWin = true;
    restartBtn.show();

    // Save high score
    if (bestTime === null || currentTime < bestTime) {
      bestTime = currentTime;
      localStorage.setItem("bestTime", bestTime);
    }
  }
}

// ------------------------------------------------------
// GAME OVER / WIN SCREENS
// ------------------------------------------------------

function drawGameOver() {
  background(0);
  fill(255, 0, 0);
  textSize(50);
  textAlign(CENTER, CENTER);
  text("YOU FELL!", width / 2, height / 2);
}

function drawWinScreen() {
  background(0, 150, 0);
  fill(255);
  textSize(40);
  textAlign(CENTER, CENTER);

  text("YOU WIN!", width / 2, height / 2 - 40);
  text("Time: " + currentTime.toFixed(2), width / 2, height / 2 + 10);

  if (bestTime !== null) {
    text("Best: " + bestTime.toFixed(2), width / 2, height / 2 + 60);
  }
}

// ------------------------------------------------------
// RESTART
// ------------------------------------------------------

function restartGame() {
  xPos = 15;
  yPos = 15;
  velX = 0;
  velY = 0;

  gameOver = false;
  gameWin = false;

  // Restart timer
  startTime = millis();

  // Restart music
  arcadeMusic.play();

  restartBtn.hide();
}

// ------------------------------------------------------
// COLLISION FUNCTION
// ------------------------------------------------------

function circleLineCollide(x, y, r, x1, y1, x2, y2) {
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = x - xx;
  let dy = y - yy;

  return dx * dx + dy * dy < r * r;
}
