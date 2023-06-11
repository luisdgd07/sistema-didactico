
/**
 * Create a new animated entity.
 *
 * Any command can have a "ref" property to allow use goto to that action.
 *
 * Commands to actions list:
 * gamechar:
 *  options: Array with characters to ask to.
 *  labels: Character label corrections.
 * goto:
 *  label: The ref label to go to.
 * ask:
 *  msg: The ask.
 *  options: Array with key word how index, and function how value.
 *  help: Optional, message if the NPC can't identify the user command.
 * speak: Speak a message.
 *  msg: The message.
 * event: Throw a simple event.
 *  id: The event ID.
 * log: Display a console message.
 *  msg: The message.
 * seedown: The NPC see down.
 * seeup: The NPC see up.
 * seeleft: The NPC see left.
 * seeright: The NPC see right.
 * show: Do the NPC visible.
 * hide: Do the NPC invisible.
 * sound: Play a sound.
 *  sound: Sound ID.
 *  repetitions: Number of repetitions, -1 to infinite.
 *  volume: Sound volume, between 0 and 1.
 * sleeprand: Sleep random time.
 *  min: ms
 *  max: ms
 * sleep: Sleep a frame
 *  ms: ms
 * tox: Go to pixel X.
 *  x: Pixel position.
 * toy: Go to pixel Y.
 *  y: Pixel position.
 * reset: Reset action list, go to first action.
 * destroy: Destroy this NPC.
 *
 * @param id Entity ID.
 * @param settings
 *
 * @returns {*} Entity
 */
function addNpc(id, settings) {
    let npc;
    let options = {};

    options.x = settings.x || 0;
    options.y = settings.y || 0;
    options.w = settings.w || 96;
    options.h = settings.h || 96;
    options.actions = settings.actions || [{cmd: 'sleep'}];
    options.customStep = settings.customStep || 100;
    // options.animDown = settings.animDown || 'walk_down';
    // options.animUp = settings.animUp || 'walk_up';
    // options.animRight = settings.animRight || 'walk_right';
    // options.animLeft = settings.animLeft || 'walk_left';
    options.animDown = settings.animDown || {id: 'walk_down', speed: 250, frames: [[0, 0], [0, 1],[1, 0], [1, 1]]};
    options.animUp = settings.animUp || {id: 'walk_up', speed: 250, frames: [[0, 0], [0, 1],[1, 0], [1, 1]]};
    options.animRight = settings.animRight || {id: 'walk_right', speed: 250, frames: [[0, 0], [0, 1],[1, 0], [1, 1]]};
    options.animLeft = settings.animLeft || {id: 'walk_left', speed: 250, frames: [[0, 0], [0, 1],[1, 0], [1, 1]]};

    /**
     * Update player sprite.
     *
     * @param component
     */
    function updatePlayer(component) {
        npc.removeComponent(options.animLeft.id);
        npc.removeComponent(options.animRight.id);
        npc.removeComponent(options.animUp.id);
        npc.removeComponent(options.animDown.id);
        npc.addComponent(component).attr({w: options.w, h: options.h});
    }

    Crafty.c(id, {
        init: function() {
            //setup animations
            this.requires("SpriteAnimation")
                .reel(options.animLeft.id, options.animLeft.speed, options.animLeft.frames)
                .reel(options.animRight.id, options.animRight.speed, options.animRight.frames)
                .reel(options.animUp.id, options.animUp.speed, options.animUp.frames)
                .reel(options.animDown.id, options.animDown.speed, options.animDown.frames)
                //change direction when a direction change event is received
                .bind(id+"Direction",
                    function (direction) {
                        if (direction.x < 0) {
                            if (!this.isPlaying(options.animLeft.id)) {
                                // if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer(options.animLeft.id);
                                this.animate(options.animLeft.id, -1);
                            }
                        }
                        if (direction.x > 0) {
                            if (!this.isPlaying(options.animRight.id)) {
                                // if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer(options.animRight.id);
                                this.animate(options.animRight.id, -1);
                            }
                        }
                        if (direction.y < 0) {
                            if (!this.isPlaying(options.animUp.id)) {
                                // if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer(options.animUp.id);
                                this.animate(options.animUp.id, -1);
                            }
                        }
                        if (direction.y > 0) {
                            if (!this.isPlaying(options.animDown.id)) {
                                // if (!Crafty.audio.isPlaying("steps")) Crafty.audio.play("steps", -1, 1);
                                updatePlayer(options.animDown.id);
                                this.animate(options.animDown.id, -1);
                            }
                        }
                        if(!direction.x && !direction.y) {
                            // Crafty.audio.stop("steps");
                            this.pauseAnimation();
                            this.resetAnimation();
                        }
                    })
                .bind("UpdateFrame", function(eventData) {
                    if (this.actionIndex >= this.actions.length) {
                        console.log(id+' without actions, I destroy it.');
                        this.destroy();
                        return;
                    }
                    let cmd = this.actions[this.actionIndex];
                    switch (cmd.cmd) {
                        case 'gamechar':
                            if (this.working && !isSpeaking) {
                                showCharacter(cmd.originalMsg);
                            }
                            if (!this.working) {
                                this.working = true;
                                if (!cmd.originalMsg) {
                                    cmd.originalMsg = cmd.options[rand(0, cmd.options.length - 1)];
                                    if (!cmd.msg) {
                                        cmd.msg = alternativeText('¿Qué letra estoy mostrando?');
                                    }
                                    this.tryCounter = 0;
                                }

                                this.bind('listener.result', function(data) {
                                    this.unbind('listener.result');
                                    if (isCommand('letra '+cmd.originalMsg, data.result)) {
                                        speak(alternativeText('Muy bien !!.')+' '+alternativeText('¿Qué letra estoy mostrando?'));
                                        showCharacter(' ');
                                        this.working = false;
                                        cmd.originalMsg = false;
                                    } else {
                                        if (this.tryCounter < 1) {
                                            cmd.msg = alternativeText('Casi aciertas, pero no.');
                                            if (cmd.help) {
                                                cmd.msg += cmd.help;
                                            }
                                            this.working = false;
                                            this.tryCounter++;
                                        } else {
                                            let character = cmd.originalMsg.toLowerCase();
                                            if (cmd.labels[character]) {
                                                character = cmd.labels[character];
                                            }
                                            cmd.msg = 'La letra que viste es la "'+character+'".';
                                            cmd.msg += ' No pasa nada, seguro que la proxima vez recuerdas la letra "'+character+'".';
                                            cmd.msg += ' Intentemos otra por que la letra "'+character+'" se te atascó.';
                                            cmd.msg += alternativeText('¿Qué letra estoy mostrando?');
                                            showCharacter(cmd.originalMsg);
                                            this.working = false;
                                            cmd.originalMsg = false;
                                        }
                                    }
                                });
                                speak(cmd.msg);
                            }
                            break;
                        case 'ask':
                            if (!this.working) {
                                this.working = true;
                                if (!cmd.originalMsg) {
                                    cmd.originalMsg = cmd.msg;
                                }
                                var me = this;
                                this.bind('listener.result', function(data) {
                                    var foundCommand = false;
                                    var commands = [];
                                    this.unbind('listener.result');
                                    for (var command in cmd.options) {
                                        // obj.hasOwnProperty() is used to filter out properties from the object's prototype chain
                                        if (cmd.options.hasOwnProperty(command)) {
                                            commands.push(command);
                                            if (isCommand(command, data.result)) {
                                                // Update before the response to allow to do goto.
                                                me.actionIndex += 1;
                                                this.working = false;
                                                foundCommand = true;
                                                cmd.originalMsg = undefined;
                                                cmd.options[command](this);
                                                break;
                                            }
                                        }
                                    }
                                    if (!foundCommand) {
                                        cmd.msg = 'Lo siento, no te entendí. '+cmd.originalMsg;
                                        if (cmd.help) {
                                            cmd.msg += '. '+cmd.help;
                                        } else {
                                            cmd.msg += '. Puedes responder: '+formatCommandList(commands);
                                        }
                                        this.working = false;
                                    }
                                })
                                speak(cmd.msg);
                            }
                            break;
                        case 'speak':
                            if (!this.working) {
                                this.working = true;
                                var me = this;
                                speak(cmd.msg, function() {
                                    setTimeout(function() {
                                        // Delay to free the action.
                                        // The speech need some time to allow reuse it.
                                        me.working = false;
                                        me.actionIndex += 1;
                                    }, 250);
                                });
                            }
                            break;
                        case 'goto':
                            this.goto(cmd.label);
                            break;
                        case 'event':
                            Crafty.trigger(cmd.id, {entity: this});
                            this.actionIndex += 1;
                            break;
                        case 'log':
                            console.log(cmd.msg);
                            this.actionIndex += 1;
                            break;
                        case 'seedown':
                            this.actionIndex += 1;
                            this.trigger(id+"Direction", {x: 0, y: 1});
                            this.trigger(id+"Direction", {x: 0, y: 0});
                            break;
                        case 'seeup':
                            this.actionIndex += 1;
                            this.trigger(id+"Direction", {x: 0, y: -1});
                            this.trigger(id+"Direction", {x: 0, y: 0});
                            break;
                        case 'seeleft':
                            this.actionIndex += 1;
                            this.trigger(id+"Direction", {x: -1, y: 0});
                            this.trigger(id+"Direction", {x: 0, y: 0});
                            break;
                        case 'seeright':
                            this.actionIndex += 1;
                            this.trigger(id+"Direction", {x: 1, y: 0});
                            this.trigger(id+"Direction", {x: 0, y: 0});
                            break;
                        case 'hide':
                            this.visible = false;
                            this.actionIndex += 1;
                            break;
                        case 'show':
                            this.visible = true;
                            this.actionIndex += 1;
                            break;
                        case 'sound':
                            if (cmd.sound) {
                                let repetitions = cmd.repetitions || 1;
                                let volume = cmd.volume || 1;
                                Crafty.audio.play(cmd.sound, cmd.repetitions, cmd.volume);
                            }
                            this.actionIndex += 1;
                            break;
                        case 'sleeprand':
                            if (!this.ms) {
                                this.ms = 0;
                            }
                            if (!this.dms) {
                                this.dms = rand(cmd.min, cmd.max);
                            }
                            this.ms += eventData.dt;
                            if (this.ms > this.dms) {
                                this.ms = undefined;
                                this.dms = undefined;
                                this.actionIndex += 1;
                            }
                            break;
                        case 'sleep':
                            if (cmd.ms) {
                                if (!this.ms) {
                                    this.ms = 0;
                                }
                                this.ms += eventData.dt;
                                if (this.ms > cmd.ms) {
                                    this.ms = undefined;
                                    this.actionIndex += 1;
                                }
                            }
                            break;
                        case 'randx':
                            if (!this.dx) {
                                this.dx = rand(cmd.min, cmd.max);
                            }
                            currentStep = this.customStep * (eventData.dt / 1000);
                            if (this.x + currentStep > this.dx && this.x - currentStep < this.dx) {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.dx = undefined;
                                this.actionIndex += 1;
                            } else if (this.x < this.dx) {
                                this.trigger(id+"Direction", {x: 1, y: 0});
                                this.x = round(this.x + currentStep);
                            } else if (this.x > this.dx) {
                                this.trigger(id+"Direction", {x: -1, y: 0});
                                this.x = round(this.x + currentStep * -1);
                            } else {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.dx = undefined;
                                this.actionIndex += 1;
                            }
                            break;
                        case 'randy':
                            if (!this.dx) {
                                this.dx = rand(cmd.min, cmd.max);
                            }
                            currentStep = this.customStep * (eventData.dt / 1000);
                            if (this.y + currentStep > this.dx && this.y - currentStep < this.dx) {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.dx = undefined;
                                this.actionIndex += 1;
                            } else if (this.y < this.dx) {
                                this.trigger(id+"Direction", {x: 0, y: 1});
                                this.y = round(this.y + this.customStep * (eventData.dt / 1000));
                            } else if (this.y > this.dx) {
                                this.trigger(id+"Direction", {x: 0, y: -1});
                                this.y = round(this.y + (this.customStep * -1) * (eventData.dt / 1000));
                            } else {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.dx = undefined;
                                this.actionIndex += 1;
                            }
                            break;
                        case 'tox':
                            currentStep = this.customStep * (eventData.dt / 1000);
                            if (this.x + currentStep > cmd.x && this.x - currentStep < cmd.x) {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.actionIndex += 1;
                            } else if (this.x < cmd.x) {
                                this.trigger(id+"Direction", {x: 1, y: 0});
                                this.x = round(this.x + currentStep);
                            } else if (this.x > cmd.x) {
                                this.trigger(id+"Direction", {x: -1, y: 0});
                                this.x = round(this.x + currentStep * -1);
                            } else {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.actionIndex += 1;
                            }
                            break;
                        case 'toy':
                            currentStep = this.customStep * (eventData.dt / 1000);
                            if (this.y + currentStep > cmd.y && this.y - currentStep < cmd.y) {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.actionIndex += 1;
                            } else if (this.y < cmd.y) {
                                this.trigger(id+"Direction", {x: 0, y: 1});
                                this.y = round(this.y + currentStep);
                            } else if (this.y > cmd.y) {
                                this.trigger(id+"Direction", {x: 0, y: -1});
                                this.y = round(this.y + currentStep * -1);
                            } else {
                                this.trigger(id+"Direction", {x: 0, y: 0});
                                this.actionIndex += 1;
                            }
                            break;
                        case 'reset':
                            this.actionIndex = 0;
                            break;
                        case 'destroy':
                            this.actions = [{cmd: 'sleep'}];
                            this.actionIndex = 0;
                            this.destroy();
                            break;
                        default:
                            console.log('Unknown command: ', cmd);
                            this.actionIndex += 1;
                            break;
                    }
                });
            return this;
        }
    });
    npc = Crafty.e("2D, DOM, "+options.animDown.id+", "+id+", Animate")
        .attr({x: options.x, y: options.y, w: options.w, h: options.h});
    npc.customStep = options.customStep;
    npc.actions = options.actions;
    npc.actionIndex = 0;
    npc.goto = function(label) {
        let found = false;
        for (let i = 0; i < this.actions.length; i++) {
            let target = this.actions[i];
            if (target.ref === label) {
                this.actionIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            console.log('GOTO: ref not found: '+cmd.ref);
            this.actionIndex += 1;
        }
    };
    npc.trigger(id+"Direction", {x: 1, y: 0});
    return npc;
}

/**
 * Reset alternative text first use.
 */
function alternativeTextReset() {
    alternativeMessagesFirst = {};
}

/**
 * Alternate the text with other options.
 *
 * @param text
 *
 * @returns {*}
 */
function alternativeText(text) {
    if(!alternativeMessagesFirst.hasOwnProperty(text)) {
        alternativeMessagesFirst[text] = true;
        return text;
    }
    if(alternativeMessages.hasOwnProperty(text)) {
        let len = alternativeMessages[text].length;
        return alternativeMessages[text][rand(0, len - 1)];
    }

    return text;
}

/**
 * White horse NPC.
 *
 * @param x
 * @param y
 * @param speed
 * @param actions
 *
 * @returns {{customStep, x, animLeft: {frames: number[][], id: string, speed: number}, y, animUp: {frames: number[][], id: string, speed: number}, animRight: {frames: number[][], id: string, speed: number}, actions, animDown: {frames: number[][], id: string, speed: number}}}
 */
function getWhiteHorse(x, y, speed, actions) {
    return {
        x: x,
        y:y,
        customStep: speed,
        actions: actions,
        animDown: {id: 'wHorseDown', speed: 250, frames: [[0,0], [1,0], [2,0]]},
        animUp: {id: 'wHorseUp', speed: 250, frames: [[0,3], [1,3], [2,3]]},
        animRight: {id: 'wHorseLeft', speed: 250, frames: [[0,2], [1,2], [2,2]]},
        animLeft: {id: 'wHorseRight', speed: 250, frames: [[0,1], [1,1], [2,1]]},
    };
}

/**
 * Black horse NPC.
 *
 * @param x
 * @param y
 * @param speed
 * @param actions
 *
 * @returns {{customStep, x, animLeft: {frames: number[][], id: string, speed: number}, y, animUp: {frames: number[][], id: string, speed: number}, animRight: {frames: number[][], id: string, speed: number}, actions, animDown: {frames: number[][], id: string, speed: number}}}
 */
function getBlackHorse(x, y, speed, actions) {
    return {
        x: x,
        y:y,
        customStep: speed,
        actions: actions,
        animDown: {id: 'bHorseDown', speed: 250, frames: [[3,0], [4,0], [5,0]]},
        animUp: {id: 'bHorseUp', speed: 250, frames: [[3,3], [4,3], [5,3]]},
        animRight: {id: 'bHorseLeft', speed: 250, frames: [[3,2], [4,2], [5,2]]},
        animLeft: {id: 'bHorseRight', speed: 250, frames: [[3,1], [4,1], [5,1]]},
    };
}

/**
 * Generate baby chicks.
 *
 * @param amount
 */
function spawnChicks(amount) {
    for (let i = 1; i <= amount; ++i) {
        addNpc(
            'npcChicks'+i,
            getBabyChick(rand(1, 8), rand(160, 800), rand(186, 450), rand(30, 50), [
                {cmd: 'randx', min: 160, max: 800},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randy', min: 186, max: 450},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randx', min: 160, max: 800},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randy', min: 186, max: 450},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'reset'},
            ]));
    }
}

/**
 * Generate baby chicks.
 *
 * @param amount
 */
function spawnChickens(amount) {
    for (let i = 1; i <= amount; ++i) {
        addNpc(
            'npcChickens'+i,
            getChicken(rand(1, 8), rand(160, 800), rand(186, 450), rand(30, 50), [
                {cmd: 'randx', min: 160, max: 800},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randy', min: 186, max: 450},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randx', min: 160, max: 800},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'randy', min: 186, max: 450},
                {cmd: 'sleeprand', min: 1300, max: 4000},
                {cmd: 'reset'},
            ]));
    }
}

/**
 * Generate flaying bird.
 *
 * @param toLeft Fly to left? false to fly to right.
 */
function spawnFlayingBird(toLeft) {
    if (toLeft === undefined) toLeft = true;
    let actions = [];
    if (toLeft) {
        actions.push({cmd: 'tox', x: -100});
    } else {
        actions.push({cmd: 'tox', x: 1000});
    }
    actions.push({cmd: 'event', id: 'npcFlayingBirdDestroyed'});
    actions.push({cmd: 'destroy'});
    addNpc('npcFlayingBird', getBird(rand(5, 8), 1000, rand(10, 600), 150, actions));
}

/**
 * Baby chick NPC.
 *
 * @param chick From 1 to 8
 * @param x
 * @param y
 * @param speed
 * @param actions
 *
 * @returns {{customStep, x, animLeft: {frames: number[][], id: string, speed: number}, y, animUp: {frames: number[][], id: string, speed: number}, animRight: {frames: number[][], id: string, speed: number}, actions, animDown: {frames: number[][], id: string, speed: number}}}
 */
function getBabyChick(chick, x, y, speed, actions) {
    let baseX = 0, baseY = 0;
    switch (chick) {
        case 2: baseX = 3; baseY = 0; break;
        case 3: baseX = 6; baseY = 0; break;
        case 4: baseX = 9; baseY = 0; break;
        case 5: baseX = 0; baseY = 4; break;
        case 6: baseX = 3; baseY = 4; break;
        case 7: baseX = 6; baseY = 4; break;
        case 8: baseX = 9; baseY = 4; break;
    }
    return {
        x: x,
        y: y,
        w: 32,
        h: 32,
        customStep: speed,
        actions: actions,
        animDown:   {id: 'chicks1Down', speed: 250, frames: [[baseX,baseY], [baseX+1,baseY], [baseX+2,baseY]]},
        animUp:     {id: 'chicks1Up',   speed: 250, frames: [[baseX,baseY+3], [baseX+1,baseY+3], [baseX+2,baseY+3]]},
        animRight:  {id: 'chicks1Left', speed: 250, frames: [[baseX,baseY+2], [baseX+1,baseY+2], [baseX+2,baseY+2]]},
        animLeft:   {id: 'chicks1Right',speed: 250, frames: [[baseX,baseY+1], [baseX+1,baseY+1], [baseX+2,baseY+1]]},
    };
}

/**
 * Bird NPC.
 *
 * @param bird From 1 to 8
 * @param x
 * @param y
 * @param speed
 * @param actions
 *
 * @returns {{customStep, x, animLeft: {frames: number[][], id: string, speed: number}, y, animUp: {frames: number[][], id: string, speed: number}, animRight: {frames: number[][], id: string, speed: number}, actions, animDown: {frames: number[][], id: string, speed: number}}}
 */
function getBird(bird, x, y, speed, actions) {
    let baseX = 0, baseY = 0;
    switch (bird) {
        case 2: baseX = 3; baseY = 0; break;
        case 3: baseX = 6; baseY = 0; break;
        case 4: baseX = 9; baseY = 0; break;
        case 5: baseX = 0; baseY = 4; break;
        case 6: baseX = 3; baseY = 4; break;
        case 7: baseX = 6; baseY = 4; break;
        case 8: baseX = 9; baseY = 4; break;
    }
    return {
        x: x,
        y: y,
        w: 48,
        h: 48,
        customStep: speed,
        actions: actions,
        animDown:   {id: 'birdsFlyingDown', speed: 250, frames: [[baseX,baseY], [baseX+1,baseY], [baseX+2,baseY]]},
        animUp:     {id: 'birdsFlyingUp',   speed: 250, frames: [[baseX,baseY+3], [baseX+1,baseY+3], [baseX+2,baseY+3]]},
        animRight:  {id: 'birdsFlyingLeft', speed: 250, frames: [[baseX,baseY+2], [baseX+1,baseY+2], [baseX+2,baseY+2]]},
        animLeft:   {id: 'birdsFlyingRight',speed: 250, frames: [[baseX,baseY+1], [baseX+1,baseY+1], [baseX+2,baseY+1]]},
    };
}

/**
 * Chicken NPC.
 *
 * @param chick From 1 to 8
 * @param x
 * @param y
 * @param speed
 * @param actions
 *
 * @returns {{customStep, x, animLeft: {frames: number[][], id: string, speed: number}, y, animUp: {frames: number[][], id: string, speed: number}, animRight: {frames: number[][], id: string, speed: number}, actions, animDown: {frames: number[][], id: string, speed: number}}}
 */
function getChicken(chick, x, y, speed, actions) {
    let baseX = 0, baseY = 0;
    switch (chick) {
        case 2: baseX = 3; baseY = 0; break;
        case 3: baseX = 6; baseY = 0; break;
        case 4: baseX = 9; baseY = 0; break;
        case 5: baseX = 0; baseY = 4; break;
        case 6: baseX = 3; baseY = 4; break;
        case 7: baseX = 6; baseY = 4; break;
        case 8: baseX = 9; baseY = 4; break;
    }
    return {
        x: x,
        y: y,
        w: 48,
        h: 48,
        customStep: speed,
        actions: actions,
        animDown:   {id: 'chickenDown', speed: 250, frames: [[baseX,baseY], [baseX+1,baseY], [baseX+2,baseY]]},
        animUp:     {id: 'chickenUp',   speed: 250, frames: [[baseX,baseY+3], [baseX+1,baseY+3], [baseX+2,baseY+3]]},
        animRight:  {id: 'chickenLeft', speed: 250, frames: [[baseX,baseY+2], [baseX+1,baseY+2], [baseX+2,baseY+2]]},
        animLeft:   {id: 'chickenRight',speed: 250, frames: [[baseX,baseY+1], [baseX+1,baseY+1], [baseX+2,baseY+1]]},
    };
}
