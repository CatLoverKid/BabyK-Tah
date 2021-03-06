var canvas = document.getElementById("canvas");
var ctx = canvas.getContext('2d');
var backgroundColor = '#A1D490'
var timerCollection = [];
var frameCount = 0;
var healthBar = document.getElementById('healthBar');


function drawBG() {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
};

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
};

function distanceBetween(p, q) {
  var dx = q.x - p.x;
  var dy = q.y - p.y;
  return Math.sqrt(dx * dx + dy * dy)
};

document.onmousemove = function(e) {
  var canvasRect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - canvasRect.left;
  mouse.y = e.clientY - canvasRect.top;
};


class Actor {
  constructor(x, y, color, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  draw() {
    ctx.strokeStyle = backgroundColor;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }
  moveToward(target, speed) {
    var dx = target.x - this.x;
    var dy = target.y - this.y;
    var distance = Math.sqrt((dx * dx) + (dy * dy));
    if (distance < 1) {
      return this;
    }
    this.x = clamp(this.x + speed * dx / distance, 0, canvas.width);
    this.y = clamp(this.y + speed * dy / distance, 0, canvas.height);
  }
};


class Player extends Actor {
  constructor(x, y, color, radius, speed) {
    super(x, y, color, radius)
    this.alive = true;
    this.health = healthBar.value;
    this.speed = speed;
    this.originalSpeed = speed;
    this.originalColor = color;
  }
  run() {
    this.checkIfHealthIsZero();
    this.moveToward(mouse, this.speed);
    this.updateHealthBar();
    this.draw();
  }
  isAlive() {
    return this.alive;
  }
  die() {
    player.health = 0;
    this.updateHealthBar();
    this.alive = false;
  }
  powerDown() {
    this.speed = this.originalSpeed;
    this.color = this.originalColor;
  }
  gainPowerUp(speed, color) {
    this.speed = speed;
    this.color = color;
  }
  damage() {
    player.health -= Math.floor(frameCount / 50);
  }
  checkIfHealthIsZero() {
    if (player.health <= 0) {
      player.die();
    }
  }
  updateHealthBar() {
    healthBar.value = player.health;
  }
}


class Zombie extends Actor {
  constructor(speed) {
    super(Math.random() * canvas.width, Math.random() * canvas.height, 'brown', 15);
    this.speed = speed;    
   this.correctSpawnPosition();
  }
  correctSpawnPosition() {
    if (this.x > 0 && this.x < player.x * 2) {
      this.x += player.x * 2;
    }
    if (this.y > 0 && this.y < player.y * 2) {
      this.y += player.y * 2;
   }
  }
  checkCollisions(target) {
    return distanceBetween(this, target) < 2 * target.radius;
  }
  attack(agent) {
    this.moveToward(agent, frameCount / 1000 + this.speed);
    this.draw();
    if (this.checkCollisions(agent)) {
      player.damage();
    }
  }
}


class PowerUp extends Actor {
  constructor() {
    super(Math.random() * canvas.width, Math.random() * canvas.height, 'yellow', 15);
    this.spawned = false;
    this.timerStarted = false;
  }
  checkCollisions(target) {
    return distanceBetween(this, target) < 2 * target.radius;
  }
  startPowerUpSpawnTimer() {
    if (!this.timerStarted) {
      setTimeout(powerUp.spawnPowerUp, 15000);
      this.timerStarted = true;
    }
  }
  spawnPowerUp() {
    powerUp.x = Math.random() * canvas.width;
    powerUp.y = Math.random() * canvas.height;
    powerUp.color = 'yellow';
    powerUp.spawned = true;
  }
  
  powerDownPlayer() {
    player.powerDown();
  }
  
  startPowerUp() {
    this.spawned = false;
    this.timerStarted = false;
    player.gainPowerUp(10, 'purple');
    setTimeout(this.powerDownPlayer, 5000);
  }
  update(agent) {
    this.startPowerUpSpawnTimer();
    if (this.spawned) {
      this.draw();
      if (this.checkCollisions(agent)) {
        this.startPowerUp();
      }
    }
  }
}


function refreshScene() {
  drawBG();
  player.run();

  for (var zombie of zombies) {
    zombie.attack(player)
  }
  powerUp.update(player);
  frameCount += 1;
  nextFrameIfNecessary();

}



function nextFrameIfNecessary() {
  if (player.isAlive()) {
    setTimeout(refreshScene, 1000 / 30);
  } else {
    alert("Game Over");
    killTimers();
  }
}

function killTimers() {
  for (var timer of timerCollection) {
    clearTimeout(timer);
  }
}


var player = new Player(100, 100, 'green', 15, 4);
var zombies = [new Zombie(0.6), new Zombie(1), new Zombie(1.4)];
var powerUp = new PowerUp;

var mouse = {x:0, y:0};

refreshScene();
