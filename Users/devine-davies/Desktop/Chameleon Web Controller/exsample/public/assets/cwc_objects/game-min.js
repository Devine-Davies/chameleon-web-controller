// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

  canvas.width  = $( window ).width();
  canvas.height = $( window ).height();

$(document).ready(function(){
  document.body.appendChild(canvas);
});

var monstersCaught = 0;
var heros    = {};
var hero = {
  // movement in pixels per second
  speed : 456,
  width : 30,
  color : 'tomato',
  monsters_caught : 0,

  draw : function( ctx, x, y ){

    ctx.beginPath();
    ctx.arc( this.x, this.y, this.width, 0, 2 * Math.PI, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.stroke();
  }
};

var monster = {
    width : 10,
    color : 'white',

    draw  : function( ctx ){
      ctx.beginPath();
      ctx.arc( this.x, this.y, this.width, 0, 2 * Math.PI, false);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
};

// Reset the game when the player catches a monster
var reset = function () {
  hero.x = canvas.width / 2;
  hero.y = canvas.height / 2;

  // Throw the monster somewhere on the screen randomly
  monster.x = 32 + (Math.random() * (canvas.width - 64));
  monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function ( modifier )
{
  /* -- hero -- */
  for(var index in heros)
  {
      var hero = heros[ index ];

      // Are they touching?
      if (
        hero.x       <= (monster.x + 32)
        && monster.x <= (hero.x    + 32)
        && hero.y    <= (monster.y + 32)
        && monster.y <= (hero.y    + 32)
      ) {
        hero.monsters_caught++;
        update_ui();
        reset();
      }
  }
};

// Draw everything
var render = function ()
{
  // ctx.drawImage(bgImage, 0, 0);
  ctx.fillStyle = "black";
  ctx.fillRect(0,0, canvas.width, canvas.height);

  /* -- hero -- */
  for(var index in heros)
  {
      heros[ index ].draw( ctx );
  }

  /* -- Monster -- */
  monster.draw( ctx );
};

var update_ui = function()
{
  var count = 0;

    /* -- hero -- */
  for(var index in heros)
  {
      count++;

      ctx.beginPath();
      ctx.arc( 50, (80 * count), 30, 0, 2 * Math.PI, false);
      ctx.fillStyle = heros[ index ].color;
      ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font      = '40px Georgia';
      ctx.fillText( heros[ index ].monsters_caught , 37, (80 * count) + 10 );
  }
}

// The main game loop
var main = function () {
  var now   = Date.now();
  var delta = now - then;

  update(delta / 1000);
  render();
  update_ui();

  then = now;

  // Request to do this again ASAP
  requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
reset();
main();

