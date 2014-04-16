
var Agriculture = Agriculture || {};

(function() {
    
    Agriculture.Map = function (stage, tilesetData) {
        this.stage = stage;
        this.tilesetData = tilesetData;
    };
    
    var p = Agriculture.Map.prototype;
    
    p._cells = [];
    
    p.load = function() {
	var tileset = new Image();
	tileset.src = this.getImgSourceFile();
        
        // compose EaselJS tileset from image (fixed 64x64 now, but can be parametized)
	var w = this.tilesetData.tilesets[0].tilewidth;
	var h = this.tilesetData.tilesets[0].tileheight;
	var imageData = {
		images : [ tileset ],
		frames : {
			width : w,
			height : h
		}
	};
	// create spritesheet
	var tilesetSheet = new createjs.SpriteSheet(imageData);
	
	// loading each layer at a time
	for (var idx = 0; idx < this.tilesetData.layers.length; idx++) {
            var layerData = this.tilesetData.layers[idx];
            if (layerData.type === 'tilelayer') {
                this.initLayer(
                    layerData, 
                    tilesetSheet, 
                    this.tilesetData.tilewidth, 
                    this.tilesetData.tileheight
                );
            }	
	}
    };
    
    p.unload = function() {
        for(t in this._cells) {
            this.stage.removeChild(this._cells[t]);
        }
    };
    
    p.getImgSourceFile = function() {
        var name = this.tilesetData.tilesets[0].name;
        return './images/'+name+'.png';
    };
    
        // layer initialization
    p.initLayer = function(layerData, tilesetSheet, tilewidth, tileheight) {
        for ( var y = 0; y < layerData.height; y++) {
            for ( var x = 0; x < layerData.width; x++) {
                // create a new Bitmap for each cell
                var cellBitmap = new createjs.Sprite(tilesetSheet);
                // layer data has single dimension array
                var idx = x + y * layerData.width;
                // tilemap data uses 1 as first value, EaselJS uses 0 (sub 1 to load correct tile)
                cellBitmap.gotoAndStop(layerData.data[idx] - 1);
                // isometrix tile positioning based on X Y order from Tiled
                cellBitmap.x = x * tilewidth ;
                cellBitmap.y = y * tileheight ;
                // add bitmap to stage
                this.stage.addChild(cellBitmap);
                
                this._cells.push(cellBitmap);
            }
        }
    };

})();