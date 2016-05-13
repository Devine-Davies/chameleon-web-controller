// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

  canvas.width  = $( window ).width();
  canvas.height = $( window ).height();

$(document).ready(function(){
  document.body.appendChild(canvas);
});


var viewport = {
    w : $( window ).width(),
    h : $( window ).height()
}

var monstersCaught = 0;
var heros    = {};
var hero = {
  // movement in pixels per second
  speed : 456,
  width : 30,
  color : 'tomato',
  monsters_caught : 0,

  x : viewport.x / 2,
  y : viewport.y / 2,

  draw : function( ctx ){

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
  var count = 0;

  /* -- hero -- */
  for(var index in heros)
  {
      var hero = heros[ index ];

      check_hero_bounds( hero );

      check_hero_collishion( hero, count );

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

      count++;
  }
};


var check_hero_collishion = function ( hero, count )
{
    var countTwo = 0;

    for (var index in heros)
    {
        if ( !(countTwo <= count) )
        {
            var this_hero = heros[ index ];

            var vx = this_hero.x - hero.x;
            var vy = this_hero.y - hero.y;

            if (vx != 0 || vy != 0)
            {
                var c   = hero.width + this_hero.width;
                var mag =  Math.sqrt( ( vx * vx ) + ( vy * vy ) );

                if ( mag < c )
                {
                    var uvx = vx / mag;
                    var uvy = vy / mag;
                    var diff     = 0.5 * (c - mag);
                    var correctX = -(uvx * (diff));
                    var correctY = -(uvy * (diff));

                    hero.x += correctX;
                    hero.y += correctY;

                    this_hero.x -= correctX;
                    this_hero.y -= correctY;
                }
            }

        }

        countTwo++;
    }


}

var check_hero_bounds = function( hero )
{
      /**/
      if( hero.x > ( viewport.w - hero.width ) )
      {
          hero.x = ( viewport.w - hero.width );
      }

      if( hero.y > ( viewport.h - hero.width ) )
      {
          hero.y = ( viewport.h - hero.width );
      }

      if( hero.x < ( hero.width ) )
      {
          hero.x =  hero.width ;
      }

      if( hero.y < ( hero.width ) )
      {
          hero.y =  hero.width;
      }
}

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