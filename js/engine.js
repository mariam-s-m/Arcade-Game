// Engine.js

var Engine = (function(global) {
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;

    // Insert canvas into the container div instead of body
    var container = doc.getElementById('canvas-container');
    if (container) {
        container.appendChild(canvas);
    } else {
        doc.body.appendChild(canvas);
    }

    function main() {
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;
        win.requestAnimationFrame(main);
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    function update(dt) {
        updateEntities(dt);
        allEnemies = cleanupEnemies(allEnemies);
    }

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    function cleanupEnemies(enemies) {
        for (var i = 0; i < enemies.length; i++) {
            while (enemies[i].x > canvas.width) {
                var row = (219 - enemies[i].y) / 83;
                var enemy = new Enemy(row);
                enemies.splice(i, 1);
                enemies.push(enemy);
            }
        }
        return enemies;
    }

    function render() {
        var rowImages = [
                'images/water-block.png',
                'images/grass-block.png',
                'images/stone-block.png',
                'images/stone-block.png',
                'images/stone-block.png',
                'images/grass-block.png'
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    function renderEntities() {
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
        player.render();
        game.render();
    }

    function reset() {
        // noop
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-cat-girl.png',
        'images/Star.png',
        'images/Heart.png'
    ]);
    Resources.onReady(init);
    global.ctx = ctx;
})(this);
