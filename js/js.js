
// ============================================================
// Character Selection
// ============================================================
var CharSelect = {
    cards: [],
    selectedIndex: 0,
    sprites: [
        'images/char-cat-girl.png',
        'images/char-boy.png',
        'images/char-pink-girl.png',
        'images/char-horn-girl.png',
        'images/char-princess-girl.png'
    ],

    init: function() {
        this.cards = Array.prototype.slice.call(
            document.querySelectorAll('.char-card')
        );
        var self = this;

        // Click support
        this.cards.forEach(function(card, i) {
            card.addEventListener('click', function() {
                self.select(i);
            });
            card.addEventListener('dblclick', function() {
                self.select(i);
                self.confirm();
            });
        });
    },

    select: function(index) {
        if (index < 0 || index >= this.cards.length) return;
        this.cards[this.selectedIndex].classList.remove('selected', 'just-selected');
        this.selectedIndex = index;
        var card = this.cards[this.selectedIndex];
        card.classList.add('selected', 'just-selected');
        setTimeout(function() {
            card.classList.remove('just-selected');
        }, 350);
    },

    confirm: function() {
        var sprite = this.sprites[this.selectedIndex];
        player.sprite = sprite;
        Resources.load([sprite]);

        // Wait for sprite to load, then start
        var checkReady = setInterval(function() {
            if (Resources.get(sprite)) {
                clearInterval(checkReady);
                showScreen('game');
                game.start();
            }
        }, 50);
    },

    handleInput: function(key) {
        if (key === 'left') {
            this.select((this.selectedIndex - 1 + this.cards.length) % this.cards.length);
        } else if (key === 'right') {
            this.select((this.selectedIndex + 1) % this.cards.length);
        } else if (key === 'enter') {
            this.confirm();
        }
    }
};

// ============================================================
// Screen Management
// ============================================================
// States: 'select' = character select, 'playing' = game, 'gameover' = game over
var currentScreen = 'select';

function showScreen(name) {
    var selectScreen = document.getElementById('char-select-screen');
    var gameScreen = document.getElementById('game-screen');

    if (name === 'select') {
        currentScreen = 'select';
        selectScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        // Re-trigger fade animation
        selectScreen.style.animation = 'none';
        void selectScreen.offsetWidth;
        selectScreen.style.animation = '';
    } else if (name === 'game') {
        currentScreen = 'game';
        selectScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameScreen.style.animation = 'none';
        void gameScreen.offsetWidth;
        gameScreen.style.animation = '';
    }
}

// ============================================================
// Enemies
// ============================================================
var Enemy = function(row) {
    this.sprite = 'images/enemy-bug.png';
    this.x = -150 - (Math.random() * 400);
    this.y = 230 - (row * 83);
    this.speed = (Math.random() * 200) + 200;
};

Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
};

Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// ============================================================
// Player
// ============================================================
var Player = function() {
    this.sprite = 'images/char-cat-girl.png';
    this.x = 200;
    this.y = 350;
    this.EndX = this.x;
    this.EndY = this.y;
    this.speed = 700;
    this.direction = 'stop';
};

Player.prototype.update = function(dt) {
    this.updatePosition(dt);
    this.enemyCollision();
    this.waterCollision();
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

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

Player.prototype.enemyCollision = function() {
    for (var i = 0; i < allEnemies.length; i++) {
        if ((this.x + 50 >= allEnemies[i].x && this.x < allEnemies[i].x + 50)
        && (this.y + 60 >= allEnemies[i].y && this.y < allEnemies[i].y + 60)) {
            this.death();
        }
    }
};

Player.prototype.waterCollision = function() {
    if (this.y < 20) {
        this.respawn();
        game.levelUp();
    }
};

Player.prototype.death = function() {
    this.respawn();
    game.death();
};

Player.prototype.respawn = function() {
    this.direction = 'stop';
    this.x = 200;
    this.y = 400;
    this.EndX = this.x;
    this.EndY = this.y;
};

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

// ============================================================
// HUD Helpers
// ============================================================
function updateHUD() {
    var scoreEl = document.getElementById('score-display');
    var levelEl = document.getElementById('level-display');
    var livesEl = document.getElementById('lives-display');
    if (scoreEl) scoreEl.textContent = game.score;
    if (levelEl) levelEl.textContent = game.level;
    if (livesEl) {
        var hearts = '';
        for (var i = 0; i < game.Stars; i++) hearts += '\u2764';
        livesEl.textContent = hearts;
    }
}

function triggerAnimation(className) {
    var container = document.getElementById('game-container-box');
    if (container) {
        container.classList.remove(className);
        void container.offsetWidth;
        container.classList.add(className);
        setTimeout(function() {
            container.classList.remove(className);
        }, 700);
    }
}

// ============================================================
// Game
// ============================================================
// state: 0 = playing, 1 = game over, 2 = character select (not started yet)
var Game = function() {
    this.level = 1;
    this.Stars = 3;
    this.score = 0;
    this.state = 2; // Start in character select
};

Game.prototype.start = function() {
    this.state = 0;
    this.level = 1;
    this.Stars = 3;
    this.score = 0;
    player.respawn();
    player.y = 350;
    player.EndY = player.y;
    allEnemies = [];
    for (var i = 0; i <= 2; i++) {
        var enemy = new Enemy(i);
        allEnemies.push(enemy);
        enemy = new Enemy(i);
        allEnemies.push(enemy);
    }
};

Game.prototype.render = function() {
    if (this.state === 2) return; // Don't render during char select
    updateHUD();

    // Game over overlay
    if (this.state === 1) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, 505, 606);

        ctx.save();
        ctx.shadowColor = '#ff4081';
        ctx.shadowBlur = 30;
        ctx.font = 'bold 48px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff4081';
        ctx.textAlign = 'center';
        ctx.fillText('GAME', 252, 230);
        ctx.fillText('OVER', 252, 290);

        ctx.shadowColor = 'transparent';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('SCORE: ' + this.score, 252, 350);

        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#00e5ff';
        ctx.fillText('Press ENTER to', 252, 410);
        ctx.fillText('choose a new hero', 252, 435);

        ctx.fillStyle = '#8888aa';
        ctx.fillText('or any arrow key', 252, 475);
        ctx.fillText('to play again', 252, 500);
        ctx.restore();
    }
};

Game.prototype.handleInputGameOver = function(key) {
    if (key === 'enter') {
        // Go back to character select
        this.state = 2;
        allEnemies = [];
        showScreen('select');
    } else if (key === 'left' || key === 'right' || key === 'up' || key === 'down') {
        // Restart with same character
        this.start();
    }
};

Game.prototype.levelUp = function() {
    this.level++;
    this.score += 10;
    triggerAnimation('level-up');
};

Game.prototype.death = function() {
    this.Stars--;
    triggerAnimation('shake');
    if (this.Stars <= 0) {
        this.gameOver();
    }
};

Game.prototype.gameOver = function() {
    this.state = 1;
    allEnemies = [];
};

// ============================================================
// Instantiate
// ============================================================
var game = new Game();
var player = new Player();
var allEnemies = [];

// ============================================================
// Input Listener
// ============================================================
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };
    var key = allowedKeys[e.keyCode];
    if (!key) return;

    if (currentScreen === 'select') {
        CharSelect.handleInput(key);
    } else if (game.state === 1) {
        game.handleInputGameOver(key);
    } else if (game.state === 0) {
        player.handleInput(key);
    }
});

// Initialize character select when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    CharSelect.init();
});
