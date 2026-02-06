
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
        this.cards = Array.prototype.slice.call(document.querySelectorAll('.char-card'));
        var self = this;
        this.cards.forEach(function(card, i) {
            card.addEventListener('click', function() { self.select(i); });
            card.addEventListener('dblclick', function() { self.select(i); self.confirm(); });
        });
    },
    select: function(index) {
        if (index < 0 || index >= this.cards.length) return;
        this.cards[this.selectedIndex].classList.remove('selected', 'just-selected');
        this.selectedIndex = index;
        var card = this.cards[this.selectedIndex];
        card.classList.add('selected', 'just-selected');
        setTimeout(function() { card.classList.remove('just-selected'); }, 350);
    },
    confirm: function() {
        var sprite = this.sprites[this.selectedIndex];
        player.sprite = sprite;
        showScreen('game');
        game.start();
    },
    handleInput: function(key) {
        if (key === 'left') this.select((this.selectedIndex - 1 + this.cards.length) % this.cards.length);
        else if (key === 'right') this.select((this.selectedIndex + 1) % this.cards.length);
        else if (key === 'enter') this.confirm();
    }
};

// ============================================================
// Screen Management
// ============================================================
var currentScreen = 'select';

function showScreen(name) {
    var selectScreen = document.getElementById('char-select-screen');
    var gameScreen = document.getElementById('game-screen');
    if (name === 'select') {
        currentScreen = 'select';
        selectScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
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
// Floating Text Popups (canvas-rendered)
// ============================================================
var floatingTexts = [];

function addFloatingText(x, y, text, color) {
    floatingTexts.push({
        x: x, y: y, text: text, color: color || '#feca57',
        life: 1.0, speed: 60
    });
}

function updateFloatingTexts(dt) {
    for (var i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].y -= floatingTexts[i].speed * dt;
        floatingTexts[i].life -= dt * 1.2;
        if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1);
    }
}

function renderFloatingTexts() {
    ctx.save();
    ctx.textAlign = 'center';
    for (var i = 0; i < floatingTexts.length; i++) {
        var ft = floatingTexts[i];
        ctx.globalAlpha = Math.max(0, ft.life);
        ctx.font = 'bold 18px "Press Start 2P", monospace';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 10;
        ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
}

// ============================================================
// Enemies — drawn as tinted rocks (different color per level)
// ============================================================
var ENEMY_TINTS = [
    { h: 0 },     // red
    { h: 270 },   // purple
    { h: 30 },    // orange
    { h: 180 },   // teal
    { h: 320 }    // magenta
];

var Enemy = function(row, level) {
    this.sprite = 'images/Rock.png';
    this.x = -120 - (Math.random() * 400);
    this.y = 230 - (row * 83);
    var lvl = level || 1;
    var baseSpeed = 200 + (lvl - 1) * 25;
    this.speed = baseSpeed + (Math.random() * 150);
    this.tintIndex = (lvl - 1) % ENEMY_TINTS.length;
    this.scale = 0.85 + Math.random() * 0.3;
};

Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt;
};

Enemy.prototype.render = function() {
    var img = Resources.get(this.sprite);
    if (!img) return;
    ctx.save();
    var w = 101 * this.scale;
    var h = 171 * this.scale;
    var offsetY = (171 - h) / 2;
    // Apply hue rotation to tint rocks
    ctx.filter = 'hue-rotate(' + ENEMY_TINTS[this.tintIndex].h + 'deg) saturate(1.8) brightness(1.1)';
    ctx.drawImage(img, this.x + (101 - w) / 2, this.y + offsetY, w, h);
    ctx.filter = 'none';
    ctx.restore();
};

// ============================================================
// Collectible Gems
// ============================================================
var GEM_TYPES = [
    { sprite: 'images/Gem Blue.png', points: 15, color: '#54a0ff' },
    { sprite: 'images/Gem Green.png', points: 25, color: '#00d2d3' },
    { sprite: 'images/Gem Orange.png', points: 50, color: '#ff9f43' }
];

var gems = [];

function spawnGem() {
    var type = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
    var col = Math.floor(Math.random() * 5);
    var row = 1 + Math.floor(Math.random() * 4); // rows 1-4 (stone + grass)
    gems.push({
        x: col * 101,
        y: row * 83 + 25,
        type: type,
        life: 6 + Math.random() * 4, // disappears after 6-10 seconds
        pulse: 0
    });
}

function updateGems(dt) {
    for (var i = gems.length - 1; i >= 0; i--) {
        gems[i].life -= dt;
        gems[i].pulse += dt * 4;
        if (gems[i].life <= 0) gems.splice(i, 1);
    }
}

function renderGems() {
    for (var i = 0; i < gems.length; i++) {
        var g = gems[i];
        var img = Resources.get(g.type.sprite);
        if (!img) continue;
        ctx.save();
        var s = 0.4 + Math.sin(g.pulse) * 0.05;
        var w = 101 * s;
        var h = 171 * s;
        // Blink when about to expire
        if (g.life < 2) {
            ctx.globalAlpha = 0.4 + Math.sin(g.pulse * 3) * 0.4;
        }
        ctx.drawImage(img, g.x + (101 - w) / 2, g.y + (83 - h) / 2, w, h);
        ctx.restore();
    }
}

function checkGemCollision() {
    for (var i = gems.length - 1; i >= 0; i--) {
        var g = gems[i];
        if (Math.abs(player.x - g.x) < 60 && Math.abs(player.y - g.y) < 60) {
            game.addScore(g.type.points);
            addFloatingText(g.x + 50, g.y, '+' + g.type.points, g.type.color);
            gems.splice(i, 1);
        }
    }
}

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
    checkGemCollision();
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.updatePosition = function(dt) {
    if (this.direction === 'left') {
        this.x -= this.speed * dt;
        if (this.x <= this.EndX - 110) {
            this.x = this.EndX - 110; this.EndX = this.x; this.direction = 'stop';
        }
    } else if (this.direction === 'up') {
        this.y -= this.speed * dt;
        if (this.y <= this.EndY - 85) {
            this.y = this.EndY - 85; this.EndY = this.y; this.direction = 'stop';
        }
    } else if (this.direction === 'right') {
        this.x += this.speed * dt;
        if (this.x >= this.EndX + 110) {
            this.x = this.EndX + 110; this.EndX = this.x; this.direction = 'stop';
        }
    } else if (this.direction === 'down') {
        this.y += this.speed * dt;
        if (this.y >= this.EndY + 85) {
            this.y = this.EndY + 85; this.EndY = this.y; this.direction = 'stop';
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
    this.x = 200; this.y = 400;
    this.EndX = this.x; this.EndY = this.y;
};

Player.prototype.handleInput = function(key) {
    if (this.direction === 'stop') {
        if ((key === 'left' && this.x > 0) ||
           (key === 'up' && this.y > 0) ||
           (key === 'right' && this.x < 500) ||
           (key === 'down' && this.y < 400)) {
            this.direction = key;
            this.EndX = this.x; this.EndY = this.y;
        }
    }
};

// ============================================================
// HUD Helpers
// ============================================================
function popStat(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    setTimeout(function() { el.classList.remove('pop'); }, 200);
}

function updateHUD() {
    var scoreEl = document.getElementById('score-display');
    var levelEl = document.getElementById('level-display');
    var livesEl = document.getElementById('lives-display');
    var comboEl = document.getElementById('combo-display');
    var bestEl = document.getElementById('best-display');
    if (scoreEl) scoreEl.textContent = game.score;
    if (levelEl) levelEl.textContent = game.level;
    if (bestEl) bestEl.textContent = game.bestScore;
    if (comboEl) comboEl.textContent = game.combo > 1 ? 'x' + game.combo : '-';
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
        setTimeout(function() { container.classList.remove(className); }, 700);
    }
}

// ============================================================
// Game
// ============================================================
var Game = function() {
    this.level = 1;
    this.Stars = 3;
    this.score = 0;
    this.combo = 0;
    this.bestScore = 0;
    this.state = 2;
    this.gemTimer = 0;
    // Load best score from localStorage
    try { this.bestScore = parseInt(localStorage.getItem('bugCrosserBest')) || 0; } catch(e) {}
};

Game.prototype.start = function() {
    this.state = 0;
    this.level = 1;
    this.Stars = 3;
    this.score = 0;
    this.combo = 0;
    this.gemTimer = 0;
    gems = [];
    floatingTexts = [];
    player.respawn();
    player.y = 350;
    player.EndY = player.y;
    allEnemies = [];
    this.spawnEnemies();
};

Game.prototype.spawnEnemies = function() {
    allEnemies = [];
    for (var i = 0; i <= 2; i++) {
        allEnemies.push(new Enemy(i, this.level));
        allEnemies.push(new Enemy(i, this.level));
    }
};

Game.prototype.addScore = function(pts) {
    this.score += pts;
    this.saveBest();
    popStat('score-display');
};

Game.prototype.saveBest = function() {
    if (this.score > this.bestScore) {
        this.bestScore = this.score;
        try { localStorage.setItem('bugCrosserBest', this.bestScore); } catch(e) {}
    }
};

Game.prototype.update = function(dt) {
    if (this.state !== 0) return;
    // Gem spawning
    this.gemTimer += dt;
    if (this.gemTimer > 4 && gems.length < 3) {
        spawnGem();
        this.gemTimer = 0;
    }
    updateGems(dt);
    updateFloatingTexts(dt);
};

Game.prototype.render = function() {
    if (this.state === 2) return;
    updateHUD();

    // Render gems under entities
    renderGems();

    if (this.state === 1) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, 505, 606);

        ctx.save();
        ctx.textAlign = 'center';

        // GAME OVER
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 30;
        ctx.font = 'bold 44px "Press Start 2P", monospace';
        ctx.fillStyle = '#ff6b6b';
        ctx.fillText('GAME', 252, 200);
        ctx.fillText('OVER', 252, 260);

        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Score
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#feca57';
        ctx.fillText('SCORE: ' + this.score, 252, 320);

        // Best
        if (this.score >= this.bestScore && this.score > 0) {
            ctx.fillStyle = '#ff9ff3';
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillText('NEW BEST!', 252, 350);
        } else {
            ctx.fillStyle = '#ff9ff3';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText('BEST: ' + this.bestScore, 252, 350);
        }

        // Max combo
        ctx.fillStyle = '#4ecdc4';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('MAX COMBO: x' + this.maxCombo, 252, 385);

        // Restart hints
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText('ENTER = new hero', 252, 440);
        ctx.fillStyle = '#7c8db5';
        ctx.fillText('Arrow = play again', 252, 465);
        ctx.restore();
    }
};

Game.prototype.handleInputGameOver = function(key) {
    if (key === 'enter') {
        this.state = 2;
        allEnemies = [];
        gems = [];
        floatingTexts = [];
        showScreen('select');
    } else if (key === 'left' || key === 'right' || key === 'up' || key === 'down') {
        this.start();
    }
};

Game.prototype.levelUp = function() {
    this.combo++;
    if (!this.maxCombo || this.combo > this.maxCombo) this.maxCombo = this.combo;
    var comboBonus = this.combo > 1 ? this.combo * 5 : 0;
    var points = 10 + comboBonus;
    this.score += points;
    this.level++;
    this.saveBest();

    // Floating text
    var msg = '+' + points;
    if (this.combo > 1) msg += ' x' + this.combo;
    addFloatingText(252, 250, msg, '#4ecdc4');

    popStat('score-display');
    popStat('level-display');
    if (this.combo > 1) popStat('combo-display');
    triggerAnimation('level-up');
};

Game.prototype.death = function() {
    this.combo = 0;
    this.Stars--;
    addFloatingText(player.x + 50, player.y, '-1', '#ff6b6b');
    triggerAnimation('shake');
    if (this.Stars <= 0) {
        this.gameOver();
    }
};

Game.prototype.gameOver = function() {
    this.state = 1;
    this.saveBest();
    allEnemies = [];
    gems = [];
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
    var allowedKeys = { 37: 'left', 38: 'up', 39: 'right', 40: 'down', 13: 'enter' };
    var key = allowedKeys[e.keyCode];
    if (!key) return;
    if (currentScreen === 'select') CharSelect.handleInput(key);
    else if (game.state === 1) game.handleInputGameOver(key);
    else if (game.state === 0) player.handleInput(key);
});

document.addEventListener('DOMContentLoaded', function() {
    CharSelect.init();
});
