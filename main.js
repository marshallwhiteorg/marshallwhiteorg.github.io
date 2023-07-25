var c = document.getElementById("title-canvas");
var ctx = c.getContext("2d");
var mask;

var pointCount = 500;
var str = "OH BRAVE NEW WORLD...";
var fontStr = "bold 48pt Arial, sans-serif";
var fontSize = 48;

var updateInterval = 50; // ms
var commenceChaos = 4; // s
var boldLineDistance = 5;
var lightLineDistance = 20;

ctx.font = fontStr;
c.width = window.innerWidth;
c.height = window.innerHeight;

var whitePixels = [];
var points = [];
var point = function(x, y, vx, vy){
  this.x = x;
  this.y = y;
  this.startX = x;
  this.startY = y;
  this.vx = vx || 1;
  this.vy = vy || 1;
  this.updateCount = 0;
  this.unrestrictedMovement = 0;

  this.dynamicDistance = lightLineDistance;
}

point.prototype.update = function() {
  ctx.beginPath();
  ctx.fillStyle = "#95a5a6";
  ctx.arc(this.x, this.y, 1, 0, 2*Math.PI);
  ctx.fill();
  ctx.closePath();

  this.updateCount += 1;
  let rand = Math.random()

  // Let this point roam with 1% probability per update, after chaos is allowed
  if (this.updateCount >= 1000/updateInterval*commenceChaos && !this.unrestrictedMovement) {
    this.unrestrictedMovement = rand > .998;
  }

  if (this.unrestrictedMovement) {
    if (this.dynamicDistance < 75) {
      this.dynamicDistance += .2;
    }

    if (Math.abs(this.vx) <= 1.5) {
      this.vx = this.vx * (1 + rand);
    }
    if (Math.abs(this.vy) <= 1.5) {
      this.vy = this.vy * (1 + rand/4);
    }

    if (rand < .00001) {
      this.x = this.startX;
      this.y = this.startY;
    }
  }
  
  if (this.x+this.vx >= c.width || this.x+this.vx < 0 || !this.unrestrictedMovement && mask.data[coordsToI(this.x+this.vx, this.y, mask.width)] != 255) {
    this.vx *= -1;
    this.x += this.vx*2;
  }
  if (this.y+this.vy >= c.height || this.y+this.vy < 0 || !this.unrestrictedMovement && mask.data[coordsToI(this.x, this.y+this.vy, mask.width)] != 255) {
    this.vy *= -1;
    this.y += this.vy*2;
  }

  for (var k = 0, m = points.length; k<m; k++) {
    if (points[k]===this) continue;
    
    var d = Math.sqrt(Math.pow(this.x-points[k].x,2)+Math.pow(this.y-points[k].y,2));
    if (d < boldLineDistance) {
      ctx.lineWidth = .2;
      ctx.beginPath();
      ctx.moveTo(this.x,this.y);
      ctx.lineTo(points[k].x,points[k].y);
      ctx.stroke();
    }
    
    if (d < this.dynamicDistance) {
      ctx.lineWidth = .1;
      ctx.beginPath();
      ctx.moveTo(this.x,this.y);
      ctx.lineTo(points[k].x,points[k].y);
      ctx.stroke();
    }
  }

  this.x += this.vx;
  this.y += this.vy;
}

function loop() {
  ctx.clearRect(0,0,c.width,c.height);
  for (var k = 0, m = points.length; k < m; k++) {
    points[k].update();
  }
}

function init() {
  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.rect(0,0,c.width,c.height);
  ctx.fill();
  ctx.font = fontStr;

  ctx.fillStyle = "#fff";
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(str, c.width/2, c.height/2);
  ctx.closePath();
  
  // Save mask, this is a black rectangle with white text
  mask = ctx.getImageData(0,0,c.width,c.height);
  
  // Draw background
  ctx.clearRect(0,0,c.width,c.height);
  
  // Save all white pixels in an array
  for (var i = 0; i < mask.data.length; i += 4) {
    if (mask.data[i] == 255 && mask.data[i+1] == 255 && mask.data[i+2] == 255 && mask.data[i+3] == 255) { // note
      whitePixels.push([iToX(i,mask.width),iToY(i,mask.width)]);
    }
  }
  
  for (var k = 0; k < pointCount; k++) {
    addPoint();
  }
}

function addPoint() {
  var spawn = randomWhitePixelPoint()
  
  var p = new point(spawn[0],spawn[1], Math.floor(Math.random()*2-1), Math.floor(Math.random()*2-1));
  points.push(p);
}

function iToX(i,w) {
  return ((i%(4*w))/4);
}

function iToY(i,w) {
  return (Math.floor(i/(4*w)));
}

function coordsToI(x,y,w) {
  return ((mask.width*y)+x)*4;
}

function randomWhitePixelPoint() {
  return whitePixels[Math.floor(Math.random()*whitePixels.length)];
}

setInterval(loop, updateInterval);
init();
