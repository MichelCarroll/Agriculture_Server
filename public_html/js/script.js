
var stage = null;
var socket = null;
var map = null;

var characters = [];
var player = null;

var KEYCODE_LEFT = 37, 
        KEYCODE_RIGHT = 39,
        KEYCODE_UP = 38, 
        KEYCODE_DOWN = 40;

var MOVEMENT_SPEED = 5;

var VELOCITY_PROCESS_INTERVAL = 50;
var POSITION_HEARTBEAT_INTERVAL = 100;

var char_spritesheet;

//============================================
//INIT
//============================================
jQuery(document).ready(function() {
    bootstrap();
});

function bootstrap() {
    
    stage = new createjs.Stage("game");

    // grab canvas width and height for later calculations:
    w = stage.canvas.width;
    h = stage.canvas.height;

    manifest = [
        {src:"images/character.png", id:"character"}
    ];

    loader = new createjs.LoadQueue(false);
    loader.addEventListener("complete", loadDoneHandler);
    loader.loadManifest(manifest);
    
    this.document.onkeyup = keyUp;
    this.document.onkeydown = keyDown;
    
    setInterval(function() {
        processVelocity();
    }, VELOCITY_PROCESS_INTERVAL);
}

function loadDoneHandler() {
    char_spritesheet = new createjs.SpriteSheet({
        "images": [loader.getResult("character")],
        "frames": {"regX": 16, "height": 48, "count": 16, "regY": 24, "width": 32},
        "animations": {
            "run_down": [0, 3, "run_down", 1],
            "run_left": [4, 7, "run_left", 1],
            "run_right": [8, 11, "run_right", 1],
            "run_up": [12, 15, "run_up", 1],
            
            "down": [0, 0, "down", 1],
            "left": [4, 4, "left", 1],
            "right": [8, 8, "right", 1],
            "up": [12, 12, "up", 1]
        }
    });

    
    socket = io.connect();
    
    socket.on('identify', function (id) {
        player = addNewCharacter(id, 50,50,0,0,"");
        serverUpdatePosition();
        
        setInterval(function() {
            serverUpdatePosition();
        }, POSITION_HEARTBEAT_INTERVAL);
    });
    socket.on('add-player', function (data) {
        addNewCharacter(
            data.id,
            data.position.x,
            data.position.y,
            data.velocity.x,
            data.velocity.y,
            data.nickname
        );
    });
    socket.on('remove-player', function (data) {
        removeCharacter(data.id);
    });
    socket.on('update-velocity', function (data) {
        var char = characters[data.id];
        char.velocity = {
            "x": data.velocity.x,
            "y": data.velocity.y
        }
        char.refreshSprite();
    });
    socket.on('update-position', function (data) {
        var char = characters[data.id];
        char.x = data.position.x;
        char.y = data.position.y;
    });
    socket.on('update-nickname', function (data) {
        var char = characters[data.id];
        char.updateNickname(data.nickname);
    });
    
    socket.on('update-map', function (data) {
        var tilesetData = data.tileset;
        if(map) {
            map.unload();
        }
        map = new Agriculture.Map(stage, tilesetData);
        map.load();
        refreshCharacters();
    });
    
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", tick);
}
//============================================
//============================================

function refreshCharacters() {
    for(p in characters) {
        stage.removeChild(characters[p]);
        stage.addChild(characters[p]);
    }
}

function keyDown(event) {
    switch(event.keyCode) {
        case KEYCODE_LEFT:
                if(player.velocity.x === 0) {
                    player.velocity.x = -MOVEMENT_SPEED;
                    serverUpdateVelocity();
                    player.refreshSprite();
                }
                break;
        case KEYCODE_RIGHT: 
                if(player.velocity.x === 0) {
                    player.velocity.x = MOVEMENT_SPEED;
                    serverUpdateVelocity();
                    player.refreshSprite();
                }
                break;
        case KEYCODE_UP: 
                if(player.velocity.y === 0) {
                    player.velocity.y = -MOVEMENT_SPEED;
                    serverUpdateVelocity();
                    player.refreshSprite();
                }
                break;
        case KEYCODE_DOWN: 
                if(player.velocity.y === 0) {
                    player.velocity.y = MOVEMENT_SPEED;
                    serverUpdateVelocity();
                    player.refreshSprite();
                }
                break;
    }
}

function keyUp(event) {
    switch(event.keyCode) {
        case KEYCODE_LEFT:
                player.velocity.x = 0;
                serverUpdateVelocity();
                player.refreshSprite();
                break;
        case KEYCODE_RIGHT: 
                player.velocity.x = 0;
                serverUpdateVelocity();
                player.refreshSprite();
                break;
        case KEYCODE_UP: 
                player.velocity.y = 0;
                serverUpdateVelocity();
                player.refreshSprite();
                break;
        case KEYCODE_DOWN: 
                player.velocity.y = 0;
                serverUpdateVelocity();
                player.refreshSprite();
                break;
    }
}

function serverUpdateVelocity() {
    socket.emit('update-velocity', {
        "id": player.character_id,
        "velocity": player.velocity
    });
}

function serverUpdatePosition() {
    socket.emit('update-position', {
        "id": player.character_id,
        "position": player.position()
    });
}

function processVelocity() {
    for(char in characters) {
        characters[char].y += characters[char].velocity.y;
        characters[char].x += characters[char].velocity.x;
    }
}

function addNewCharacter(id, posX, posY, velX, velY, nickname) {
    var char = new Agriculture.Character();
    char.initialize(id, char_spritesheet, "down", velX, velY);
    char.setTransform(posX,posY,1,1);
    char.updateNickname(nickname);
    char.framerate = 10;
    stage.addChild(char);
    
    characters[id] = char;
    
    return char;
}

function removeCharacter(id) {
    var char = characters[id];
    stage.removeChild(char);
    delete characters[id];
}

function tick(event) {
    stage.update(event);
}
