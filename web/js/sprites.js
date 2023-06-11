let player;

/**
 * Add functional player.
 */
function drawPnj() {
    if (player) {
        return;
    }

    /**
     * Update player sprite.
     *
     * @param component
     */
    function updatePlayer(component) {
        player.removeComponent("walk_left");
        player.removeComponent("walk_right");
        player.removeComponent("walk_up");
        player.removeComponent("walk_down");
        player.addComponent(component).attr({w: 96, h: 96});
    }

    Crafty.c('Hero', {
        init: function() {
            //setup animations
            this.requires("SpriteAnimation, Collision")
                .reel("walk_left", 250, [[0, 0], [0, 1],[1, 0], [1, 1]])
                .reel("walk_right", 250, [[0, 0], [0, 1],[1, 0], [1, 1]])
                .reel("walk_up", 250, [[0, 0], [0, 1],[1, 0], [1, 1]])
                .reel("walk_down", 250, [[0, 0], [0, 1],[1, 0], [1, 1]])
                //change direction when a direction change event is received
                .bind("NewDirection",
                    function (direction) {
                        if (direction.x < 0) {
                            if (!this.isPlaying("walk_left")) {
                                if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer("walk_left");
                                this.animate("walk_left", -1);
                            }
                        }
                        if (direction.x > 0) {
                            if (!this.isPlaying("walk_right")) {
                                if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer("walk_right");
                                this.animate("walk_right", -1);
                            }
                        }
                        if (direction.y < 0) {
                            if (!this.isPlaying("walk_up")) {
                                if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer("walk_up");
                                this.animate("walk_up", -1);
                            }
                        }
                        if (direction.y > 0) {
                            if (!this.isPlaying("walk_down")) {
                                if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer("walk_down");
                                this.animate("walk_down", -1);
                            }
                        }
                        if(!direction.x && !direction.y) {
                            Crafty.audio.stop("steps");
                            this.pauseAnimation();
                            this.resetAnimation();
                        }
                    })
                // A rudimentary way to prevent the user from passing solid areas
                .bind('Move', function(from) {
                    if(this.hit('solid')){
                        this._x = from._x;
                        this._y = from._y;
                    }
                    // console.log(this._x, this._y);
                })
                ;
            return this;
        }
    });

    Crafty.c("RightControls", {
        init: function() {
            this.requires('Multiway');
        },

        rightControls: function(speed) {
            this.multiway(speed, {UP_ARROW: -90, DOWN_ARROW: 90, RIGHT_ARROW: 0, LEFT_ARROW: 180})
            return this;
        }

    });

    // create our player entity with some premade components
    player = Crafty.e("2D, DOM, walk_down, RightControls, Hero, Animate, Collision")
        .attr({x: 48, y: 186, w: 96, h: 96})
        .rightControls(100);
    Crafty.audio.play("closeDoor", 1, 1);
}

/**
 * Draw a tree.
 *
 * @param x
 * @param y
 * @param size Tree size, between 1 and 3.
 */
function drawTree(x, y, size) {
    if (size < 1 && size > 3 ) {
        console.log('Unknown tree size. 1 >= size >= 3.')
        size = 1;
    }
    let scale = 3;
    let tree = Crafty.e('2D, Canvas, tree'+size);
    tree.attr({x: xToPixel(x), y: yToPixel(y, tree.h), w: tree.w * scale, h: tree.h * scale});
}

/**
 * Draw a house.
 *
 * @param x Start tile.
 * @param y Start tile.
 */
function drawHouse(x, y) {
    let scale = 3;
    let house = Crafty.e('2D, Canvas, house');
    house.attr({x: xToPixel(x), y: yToPixel(y, house.h), w: house.w * scale, h: house.h * scale});
}

/**
 * Draw a boat.
 *
 * @param x Start tile.
 * @param y Start tile.
 */
function drawBoat(x, y) {
    let scale = 3;
    let boat = Crafty.e('2D, Canvas, boat');
    boat.attr({x: xToPixel(x), y: yToPixel(y, boat.h), w: boat.w * scale, h: boat.h * scale});
}

/**
 * Transform X tile position to pixels.
 *
 * @param value Position in tiles.
 *
 * @returns {number}
 */
function xToPixel(value) {
    return value * 48;
}

/**
 * Transform Y tile position to pixels.
 *
 * @param value  Position in tiles.
 * @param height Tiles sprite height.
 *
 * @returns {number}
 */
function yToPixel(value, height = 12) {
    let tilesHeight = (height / 12) - 1;
    return (value - tilesHeight) * 48;
}

/**
 * Draw tile box.
 *
 * @param w Tiles width.
 * @param h Tiles height.
 * @param sprite Sprite base name.
 */
function drawBackground(w, h, sprite) {
    let size = 48, upSpace = 2 * size;
    sprite = sprite || 'tlGrass';
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; ++j) {
            if (i === 0 && j === 0) {
                // up - left
                Crafty.e('2D, Canvas, '+sprite+'0').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (i === 0 && j === w - 1) {
                // up - right
                Crafty.e('2D, Canvas, '+sprite+'2').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (i === h - 1 && j === 0) {
                // button - left
                Crafty.e('2D, Canvas, '+sprite+'6').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (i === h - 1 && j === w - 1) {
                // button - right
                Crafty.e('2D, Canvas, '+sprite+'8').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (i > 0 && i < h - 1 && j === 0) {
                // left
                Crafty.e('2D, Canvas, '+sprite+'3').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (i > 0 && i < h - 1 && j === w - 1) {
                // Right
                Crafty.e('2D, Canvas, '+sprite+'5').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (j > 0 && j < w - 1 && i === 0) {
                // Up
                Crafty.e('2D, Canvas, '+sprite+'1').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else if (j > 0 && j < w - 1 && i === h - 1) {
                // Down
                Crafty.e('2D, Canvas, '+sprite+'7').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
            } else {
                // Inside
                Crafty.e('2D, Canvas, '+sprite+'4').attr({x: j * size, y: i * size + upSpace, w: size, h: size});
                // Returns a random integer from 0 to 100:
                let deco = Math.floor(Math.random() * 101);
                if (deco > 70) {
                    let type = Math.floor(Math.random() * 19);
                    // 20% of tiles are decoration.
                    Crafty.e('2D, Canvas, tlFlower'+type).attr({x: j * size, y: i * size + upSpace, w: size, h: size});
                }
            }
        }
    }
}

/**
 * Get ramdomized number.
 *
 * @param min
 * @param max
 * @returns {number}
 */
function rand(min, max) {
    if (min==null && max==null)
        return 0;

    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Round to usable number.
 *
 * @param num
 *
 * @returns {number}
 */
function round(num) {
    const x = Math.pow(10, 2);
    return Math.round(num * x) / x;
}