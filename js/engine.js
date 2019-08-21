// Engine.js

var Engine = (function(global) {
    // Grab the info we need and add the canvas to the DOM
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);
    ctx.font="bold 30px verdana, sans-serif ";

    // This function serves as the kickoff point for the game loop
         function main() {
         // Get our time delta information
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        // Call our update/render functions
        update(dt);
        render();

        // Set our lastTime variable which is used to determine the time delta
        // for the next time this function is called.
        lastTime = now;

        // Use the browser's requestAnimationFrame function to call this
        // function again as soon as the browser is able to draw another frame.
        win.requestAnimationFrame(main);
    }

    // This function does some initial setup
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    // This function is called by main and updates the game
    function update(dt) {
        updateEntities(dt);
        allEnemies = cleanupEnemies(allEnemies);
    }

    // This function is called by update and updates the entities
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        player.update(dt);
    }

    // This function is called by update and cleans up off-screen enemies
    function cleanupEnemies(enemies) {
        for (var i = 0; i < enemies.length; i++) {

            // I use a while loop in case multiple enemies despawn at once
            while (enemies[i].x > canvas.width) {
                var row = (219 - enemies[i].y) / 83;
                var enemy = new Enemy(row);
                enemies.splice(i, 1);
                enemies.push(enemy);
            }
        }

        return enemies;
    }

    // This function initially draws the "game level", it will then call
    // the renderEntities function.
    function render() {
        // This array holds the relative URL to the row's image
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/grass-block.png',  // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/stone-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        // Draw the grid
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    // This function is called by the render function and calls each entity's render
    function renderEntities() {
        allEnemies.forEach(function(enemy) {
        enemy.render();
        });
        player.render();
        game.render();
    }
    // Unused
    function reset() {
        // noop
    }

    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-cat-girl.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);
    global.ctx = ctx;
})(this);