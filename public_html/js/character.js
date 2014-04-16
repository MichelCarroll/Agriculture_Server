
var Agriculture = Agriculture || {};

(function() {
    
    var TEXT_Y_OFFSET = 25;
    var TEXT_SIZE = "12px";
    
    Agriculture.Character = function (){};
    var p = Agriculture.Character.prototype = new createjs.Sprite();
    p.sprite_initialize = createjs.Sprite.prototype.initialize;


    p.position = function() {
        return {
            "x": this.x,
            "y": this.y
        };
    };
    
    p.character_id = 0;
    
    p.velocity = {
        "x": 0,
        "y": 0
    };
    
    p._nickname = "";
    p._nicknameDisplayable = null;
    
    p._lastXDir = 0;
    p._lastYDir = 0;
    
    p.initialize = function(character_id, char_spritesheet, frameOrAnimation, velX, velY) {

        this.sprite_initialize(char_spritesheet, frameOrAnimation);

        this.character_id = character_id;
        this.velocity = {
            "x": velX,
            "y": velY
        };
        
        this._lastXDir = 0;
        this._lastYDir = 0;
        
        this.updateNickname("Anonymous");
    };
    
    p.refreshSprite = function() {

        var vx = this.velocity.x;
        var vy = this.velocity.y;

        //STAY STILL?
        if(vx === 0 && vy === 0) {
            if(_lastXDir > 0){
                this.gotoAndStop("right");
            }
            else if(_lastXDir < 0){
                this.gotoAndStop("left");
            }
            else if(_lastYDir > 0){
                this.gotoAndStop("down");
            }
            else if(_lastYDir < 0){
                this.gotoAndStop("up");
            }
        }

        //MOVEMENT?
        if(vx < 0) {
            this.gotoAndPlay("run_left");
            _lastXDir = -1;
        }
        else if(vx > 0) {
            this.gotoAndPlay("run_right");
            _lastXDir = 1;
        }
        else {
            _lastXDir = 0;
        }

        if(vy < 0) {
            this.gotoAndPlay("run_up");
            _lastYDir = -1;
        }
        else if(vy > 0) {
            this.gotoAndPlay("run_down");
            _lastYDir = 1;
        }
        else {
            _lastYDir = 0;
        }

    };

    p.Sprite_draw = p.draw;
    
    p.updateNickname = function (newNickname){
        this._nickname = newNickname;
        if(this._nickname.length > 0) {
            this._nicknameDisplayable = new createjs.Text(
                this._nickname, 
                "20px Arial",
                "#ff7700"
            ); 
            this._nicknameDisplayable.textBaseline = "alphabetic";
        }
        else {
            this._nicknameDisplayable = null;
        }
    };
    
    p.draw = function(ctx, ignoreCache) {
        this.Sprite_draw(ctx, ignoreCache);
        
        if(this._nicknameDisplayable) {
            ctx.font = "bold "+TEXT_SIZE+" sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.setTransform(1, 0, 0, 1, -this.regX, -this.regY);
            ctx.fillText(this._nickname, this.x, this.y+TEXT_Y_OFFSET);
        }
    };
    
})();