function Tile(map, position) {
  this.map = map;
  this.position = position;
  this.el = $("<div class='tile'><img/></div>")
  this.paint()
  this.el.css({left: this.position.x, top: this.position.y});
}

Tile.prototype = {
  paint: function() {
    var mapX = this.map.position.x + this.position.x - (this.map.buffer*this.map.tileSize),
        mapY = this.map.position.y + this.position.y - (this.map.buffer*this.map.tileSize),
        src
    mapX -= mapX % this.map.tileSize;
    mapY -= mapY % this.map.tileSize;
    src = this.map.source + "?x=" + mapX + "&y=" + mapY
    this.el.html("<img src='" + src + "'/>")
  },
  move: function(deltaX, deltaY) {
    var tileSize = this.map.tileSize,
        mapWidth = this.map.tileCount.x * tileSize,
        mapHeight = this.map.tileCount.y * tileSize,
        newX = this.position.x - deltaX,
        newY = this.position.y - deltaY
    if (newX >= mapWidth || newY >= mapHeight ||
        newX < 0 || newY < 0) {
      newX = (newX + mapWidth) % mapWidth;
      newY = (newY + mapHeight) % mapHeight;
      this.el.find("img").remove()
      setTimeout($.proxy(this.paint, this), 10);
    }
    this.position = {x: newX, y: newY}
    this.el.css({left: this.position.x, top: this.position.y});
  },
}

function Map(wrapper, source, size) {
  var tile;
  this.wrapper = wrapper;
  this.mapDiv = wrapper.find(".map");
  this.source = source;
  this.position = {x: 0, y:0};
  this.size = size;
  this.tileSize = 100;
  this.buffer = 5
  this.calculateSize();
  this.tiles = [];
  for (var j=0, _len=this.tileCount.y; j<_len; j++) {
    for (var i=0,_len2=this.tileCount.x; i<_len2; i++) {
      tile = new Tile(this, {x: i*this.tileSize, y: j*this.tileSize});
      this.tiles.push(tile);
      this.mapDiv.append(tile.el);
    }
  }
}
Map.prototype = {
  calculateSize: function() {
    var w = window.innerWidth/this.tileSize,
        h = window.innerHeight/this.tileSize
    this.displaySize = {w: window.innerWidth, h: window.innerHeight}
    this.wrapper.css({width: window.innerWidth, height: window.innerHeight})
    this.tileCount = {x: Math.ceil(w+this.buffer*2), y: Math.ceil(h+this.buffer*2)}
    this.wrapper.find(".map").css({
      width: this.tileCount.x * this.tileSize,
      height: this.tileCount.y * this.tileSize,
      left: -this.buffer * this.tileSize,
      height: -this.buffer * this.tileSize
    })
  },
  move: function(deltaX, deltaY) {
    var x = Math.max(0, Math.min(this.position.x-deltaX, this.size.w-this.displaySize.w)),
        y = Math.max(0, Math.min(this.position.y-deltaY, this.size.h-this.displaySize.h)),
        realDeltaX = x - this.position.x,
        realDeltaY = y - this.position.y;
    if (x === this.position.x && y === this.position.y) return;
    this.position = {x: x, y: y};
    this.tiles.map(function(tile) {
      tile.move(realDeltaX, realDeltaY)
    })
  },
}

$(function() {
  var wrapper = $("#wrapper"),
      pos = {x: 0, y: 0},
      map = new Map(wrapper, "/map.jpg", {w: 11527, h: 6505});

  wrapper.on("mousedown", function(e) {
    e.preventDefault();
    wrapper.dragging = true;
    pos = {x: e.clientX, y: e.clientY}
  });

  $(document.body).on("mouseup", function(e) {
    e.preventDefault();
    wrapper.dragging = false;
  });

  wrapper.on("mousemove", function(e) {
    e.preventDefault();
    if (!wrapper.dragging) return;
    if (e.clientX === pos.x && e.clientY === pos.y) return;
    var target = e.currentTarget
    map.move(e.clientX - pos.x, e.clientY - pos.y);
    pos = {x: e.clientX, y: e.clientY}
  })
})
