let gameChar = false;

window.addEventListener("load", function(){
    // Let's go...
    Crafty.init(28 * 48, 15 * 48, document.getElementById('game'));
    // Here we're just loading a single sound, and calling it "beep".
    // But you can load multiple assets at once!
    Crafty.paths({ audio: "assets/audio/", images: "assets/images/" });
    var assets = {
        "audio": {
            "bgCafeCremiux": "STREAMING-a-little-bit-of-fun-jonny-boyle-main-version-02-33-1.mp3",
            "closeDoor": "close_door.mp3",
            "steps": "step_grass.mp3",
        },
        "sprites": {
            "First Asset pack - 12x12 RPG Tileset .png": {
                "tile": 12,
                "tileh": 12,
                "map": {
                    "house": [3,0,4,7],
                    "tree1": [7,10,2,2],
                    "tree2": [5,9,2,3],
                    "tree3": [1,8,4,4],
                    "boat": [18,24,7,6],
                    // Tile: Grass
                    "tlGrass0": [18,5], "tlGrass1": [19,5], "tlGrass2": [20,5],
                    "tlGrass3": [18,6], "tlGrass4": [19,6], "tlGrass5": [20,6],
                    "tlGrass6": [18,7], "tlGrass7": [19,7], "tlGrass8": [20,7],
                    // Tile: water
                    "tlWater0": [22,13], "tlWater1": [23,13], "tlWater2": [24,13],
                    "tlWater3": [22,14], "tlWater4": [23,14], "tlWater5": [24,14],
                    "tlWater6": [22,15], "tlWater7": [23,15], "tlWater8": [24,15],
                    // Tile: Flowers
                    "tlFlower0": [2,13],"tlFlower2": [3,13],"tlFlower3": [4,13],"tlFlower4": [5,13],
                    "tlFlower5": [2,14],"tlFlower6": [3,14],"tlFlower7": [4,14],"tlFlower8": [5,14],
                    "tlFlower9": [2,15],"tlFlower10": [3,15],"tlFlower11": [4,15],"tlFlower12": [5,15],"tlFlower13": [5,15],
                    "tlFlower14": [6,15],"tlFlower15": [7,15],"tlFlower16": [8,15],"tlFlower17": [9,15],"tlFlower18": [10,15],
                },
            },
            "ACgarRight.png": {tile: 24, tileh: 24, map: {walk_right: [0, 0]}},
            "ACharLeft.png": {tile: 24, tileh: 24, map: {walk_left: [0, 0]}},
            "ACharUp.png": {tile: 24, tileh: 24, map: {walk_up: [0, 0]}},
            "ACharDown.png": {tile: 24, tileh: 24, map: {walk_down: [0, 0]}},
            "black and white horses.png": {
                tile: 48,
                tileh: 48,
                map: {
                    wHorseDown: [0, 0],
                    wHorseUp: [0, 3],
                    wHorseLeft: [0, 1],
                    wHorseRight: [0, 2],
                    bHorseDown: [3, 0],
                    bHorseUp: [3, 3],
                    bHorseLeft: [3, 1],
                    bHorseRight: [3, 2],
                }
            },
            'babychicks.png': {
                tile: 32,
                tileh: 32,
                map: {
                    chicks1Down: [0, 0],
                    chicks1Up: [0, 3],
                    chicks1Left: [0, 1],
                    chicks1Right: [0, 2],
                },
            },
            'chicken_large.png': {
                tile: 48,
                tileh: 48,
                map: {
                    chickenDown: [0, 0],
                    chickenUp: [0, 3],
                    chickenLeft: [0, 1],
                    chickenRight: [0, 2],
                },
            },
            'birds_flying.png': {
                tile: 48,
                tileh: 48,
                map: {
                    birdsFlyingDown: [0, 0],
                    birdsFlyingUp: [0, 3],
                    birdsFlyingLeft: [0, 1],
                    birdsFlyingRight: [0, 2],
                },
            },
        },
    }
    Crafty.load(assets, function() {
        // Start map tiles.
        drawBackground(20, 10);
        drawHouse(0.5, 6);
        drawTree(17, 4, 3);
        drawTree(0, 6, 1);
        drawTree(4, 3, 2);
        drawBoat(19, 10);
        // Label.
        // Crafty.e('2D, DOM, Text')
        //     .attr({
        //         x: 20,
        //         y: 400,
        //         w: 240
        //     })
        //     .text('Mini-juego !!')
        //     .textFont({
        //         size: '40px',
        //         weight: 'bold'
        //     });
        // Init main.
        // Start using modal.
        var startDialog = new bootstrap.Modal(document.getElementById('startDialog'), {});
        let startDlgBtn = document.getElementById("startDlgBtn");
        startDlgBtn.addEventListener("click", function() {
            startDialog.hide();
            startGame();
        }, false);
        startDialog.show();

        el = document.getElementById("btnStop");
        el.addEventListener("click", function() {
            stopSpeechRecognition();
        }, false);
    });
    initSpeechRecognition();
});

function startGame() {
    Crafty.audio.stop();
    Crafty.audio.play("bgCafeCremiux", -1, 0.03);
    // Start speech manager.
    setTimeout(function(){
        forceStop = false;
        spawnChicks(10);
        spawnChickens(2);
        addNpc(
            'npcWhiteHorse',
            getWhiteHorse(rand(10, 180), rand(300, 450), rand(40, 80), [
                {cmd: 'randx', min: 10, max: 180},
                {cmd: 'sleeprand', min: 1500, max: 5000},
                {cmd: 'randy', min: 300, max: 450},
                {cmd: 'sleeprand', min: 1500, max: 5000},
                {cmd: 'reset'},
            ]));
        // A flaying bird.
        function spawnBird(event) {
            setTimeout(function() {
                spawnFlayingBird(rand(0, 1) ? true : false);
            }, rand(10000, 60000));
        }
        Crafty.bind('npcFlayingBirdDestroyed', spawnBird);
        spawnBird();
        // Main NPC.
        let npc = addNpc(
            'npc1',
            {
                x: 48,
                y: 186,
                actions: heroActions,
            });
        // speak('Sá. Sé. Sí. Só. Sú. Lá. Lé. Lí. Ló. Lú.');
    }, 1000);
}

/**
 * Stop audio output and voice recognition.
 */
function stopAll() {
    let tag = document.getElementById("lblSpeechSleep");
    tag.classList.add('invisible');
    stopSpeechRecognition();
    Crafty.audio.stop();
}

/**
 * Format the list to speech.
 *
 * @param list
 * @param lastSeparator
 *
 * @returns {string}
 */
function formatCommandList(list, lastSeparator) {
    let resp = '';
    if (!lastSeparator) {
        lastSeparator = ' ó';
    }
    if (list.length === 0) {
        return resp;
    }
    if (list.length === 1) {
        return list[0];
    }
    for( let i=0; i<(list.length - 1);++i) {
        resp += ', '+list[i];
    }
    resp += ', '+lastSeparator+' '+list[list.length - 1];
    return resp;
}

/**
 * Display a char to play the game.
 *
 * @param char
 */
function showCharacter(char) {
    if (!gameChar) {
        gameChar = Crafty.e('2D, DOM, Text')
            .attr({
                x: 475,
                y: 350,
                w: 240,
            })
            .text(char)
            .textFont({
                size: '200px',
                weight: 'bold',
                // family: 'Gochi Hand',
            });
    } else {
        gameChar.text(char);
    }
}