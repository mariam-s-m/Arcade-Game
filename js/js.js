
// Enemies our player must avoid
var Enemy = function(row) {
    this.sprite = 'images/enemy-bug.png';
    this.x = -150 - (Math.random() * 400);
    this.y = 230 - (row * 83);
    this.speed = (Math.random() * 200) + 200;
};

Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The character our player controls
var Player = function( x,y,speed) {
this.sprite = 'images/char-cat-girl.png';
// TODO: determian the player posistion
    this.x = 200;
    this.y = 350;
    this.EndX = this.x;
    this.EndY = this.y;
    this.speed = 700;   // speed can be changed this value for simple level 
    // to block the player 
    this.direction = 'stop';
};

// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {
    this.updatePosition(dt);
    this.enemyCollision();
    this.waterCollision();
};

// Draw the player on the screen
   Player.prototype.render = function() {
   ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Update the player's position
// Parameter: dt, a time delta between ticks
Player.prototype.updatePosition = function(dt) {
    if (this.direction === 'left') { 
        this.x -= this.speed * dt;

    if (this.x <= this.EndX - 110) {
        this.x = this.EndX - 110;
        this.EndX = this.x;
        this.direction = 'stop';
        }
    }

    else if (this.direction === 'up') {
        this.y -= this.speed * dt;

    if (this.y <= this.EndY - 85) {
        this.y = this.EndY - 85;
        this.EndY = this.y;
        this.direction = 'stop';
        }
    }

    else if (this.direction === 'right') {
        this.x += this.speed * dt;

    if (this.x >= this.EndX + 110) {
        this.x = this.EndX + 110;
        this.EndX = this.x;
        this.direction = 'stop';
        }
    }

    else if (this.direction === 'down') {
        this.y += this.speed * dt;

    if (this.y >= this.EndY + 85) {
        this.y = this.EndY + 85;
        this.EndY = this.y;
        this.direction = 'stop';
        }
    }
};

// Check for collision with an enemy
Player.prototype.enemyCollision = function() {
    for (var i = 0; i < allEnemies.length; i++) {
        if ((this.x + 50 >= allEnemies[i].x && this.x < allEnemies[i].x + 50)
        && (this.y + 60 >= allEnemies[i].y && this.y < allEnemies[i].y + 60)) {
            this.death();
        }
    }
};

// Check for collision with water
Player.prototype.waterCollision = function() {
    if (this.y < 20) {
    //TODO : control the counter of level 
    this.respawn();
    game.levelUp();
}
};

Player.prototype.death = function() {
    this.respawn();
    game.death(); };
Player.prototype.respawn = function() {
    this.direction = 'stop';
    this.x = 200;
    this.y = 400;
    this.EndX = this.x;
    this.EndY = this.y;
}

// Handle input
Player.prototype.handleInput = function(key) {
    if (this.direction === 'stop') {
    if ((key === 'left' && this.x > 0) ||
       (key === 'up' && this.y > 0) ||
       (key === 'right' && this.x < 500) ||
       (key === 'down' && this.y < 400)) {
            this.direction = key;
            this.EndX = this.x;
            this.EndY = this.y;
        }
    }
};

// game info and functions
var Game = function() {
    this.level = 1;
    this.Stars = 3;
    this.score = 0;
    this.state = 0;
};

Game.prototype.render = function() {
    // Draw Stars as time for life
    for (i = 0; i < this.Stars; i++){
    ctx.drawImage(Resources.get('images/Star.png'), 450 - i * 30, 530, 30, 50);
    }
    // Draw score
    ctx.fillText(this.score, 30, 570);
    // Draw game over text
    if (this.state) {
  ctx.fillStyle="yellow";
  ctx.font = "bold 50px verdana, sans-serif ";
  ctx.fillText("Game Over" , 100, 350);
    }
};

Game.prototype.handleInput = function(key) {
    this.state = 0;
    this.Stars = 3;
    this.score = 0;
    for (i = 0; i <= 3; i++) {
        var enemy = new Enemy(i);
        allEnemies.push(enemy);
        enemy = new Enemy(i);
        allEnemies.push(enemy);
    }
};

Game.prototype.levelUp = function() {
    this.level++;
    this.score += 10; // start count from 10 ++
};

// Updates game info when the player dies
Game.prototype.death = function() {
    this.Stars--;
    if (this.Stars <= 0) {
    this.gameOver();
    }
};

Game.prototype.gameOver = function() {
    this.state = 1;
    allEnemies = [];
    console.log("Game Over Press On Ok To Try Again");
};

// Now instantiate your objects.
var game = new Game();
var player = new Player();
var allEnemies = [];
for (i = 0; i <= 2; i++) {
    var enemy = new Enemy(i);
    allEnemies.push(enemy);
    enemy = new Enemy(i);
    allEnemies.push(enemy);
}

// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if (game.state){
        game.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});