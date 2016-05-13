var seed = window.location.search.substring(window.location.search.indexOf('seed=') + 5);
if (seed.indexOf('&') >= 0) {
    seed = seed.substring(0, seed.indexOf('&'));
}

/*------------------------------------------------------
* @function in array
* System messages should be declared here
* We will have a list or predefined functions
*/
window.onload = function()
{
    /* -- Build our cwc objects -- */
    cwc_object_declaration();

    /* -- Connect to the server -- */
    connect_to_server();

    /* -- to make full screen -- */
    $(document).on('click', function(){
        // launch_into_fullscreen( document.documentElement );
    })

};

_controllers = [];

var cwc_object_declaration = function() {
    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    server = new cwc.Server({
        host : seed || 'http://localhost:5000/',
        port : 5000,
        type : 'ws'
    });

    Hooks = new cwc.Hooks({ });

    Hooks.set_hook( {
        hook_name : 'rand-color',
        method    : function( feedback, mdata ) {
          console.log('here');
          rand_color_got( feedback,  mdata );
        }
    });

    Hooks.set_hook( {
        hook_name : 'on-analog-move',
        method    : function( input, mdata ) {
          on_analog_move( input, mdata );
        }
    });

    Hooks.set_hook( {
        hook_name : 'on-analog-end',
        method    : function( info ) {
          on_analog_end( info );
        }
    });

};

function rand_color_got( color, data )
{
    heros[ data.key ].color = color;
}

function on_analog_end( )
{
  console.log( 'stop' );
}

function on_analog_move( feedback, mdata )
{
    heros[ mdata.key ].y += feedback.cartesian_coordinates.y * 10;
    heros[ mdata.key ].x += feedback.cartesian_coordinates.x * 10;
}

function connect_to_server()
{
    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name : 'connection-success',
      method    : function( feedback ) { on_connect( feedback ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name : 'connection-failed',
      method    : function( feedback ) { console.log( data ); }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name : 'cwc:controller-connected',
      method    : function( controller ) { controller_connected( controller ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name : 'cwc:controller-disconnected',
      method    : function( controller ) { controller_disconnected( controller ) }
    } );

    Hooks.set_hook( {
      hook_name : 'gn-item-selected',
      method    : function( feedback ) {
      }
    });

    /* -- connect to the host via web sockets -- */
    server.connect( );

}

function on_connect( data )
{
    $('.top-bar .connection-code p span').text(
        data.cluster_code
    );
}

function controller_connected( controllers )
{
    var speed = 1000;

    for( var i = 0; i < controllers.length; i++ )
    {
        heros[ controllers[ i ].key ] = jQuery.extend(true, {}, hero);
    }

    /* -- Save the contrrolers -- */
    _controllers = controllers;

    show_controller_tally( controllers );

}

function controller_disconnected( controllers )
{
    var speed = 1000;

    console.log('dis');
    console.log( controllers );

    if( controllers.length == 0 ) { heros = {}; }

    for( var i = 0; i < controllers.length; i++ )
    {
        var hero_key = controllers[ i ].key;

        console.log( 'found' );

        if( _controllers.indexOf( hero_key ) == -1 )
        {
            delete heros[ hero_key ];
            console.log('deleted');
            console.log( heros );
        }
    }

    show_controller_tally( controllers );

}

function show_controller_tally( controllers )
{
    $('.top-bar .controller-tally p span').text(
        controllers.length
    );
}

// Find the right method, call on correct element
function launch_into_fullscreen( element )
{
  if(element.requestFullscreen)
  {
    element.requestFullscreen();
  }
  else if(element.mozRequestFullScreen)
  {
    element.mozRequestFullScreen();
  }
  else if(element.webkitRequestFullscreen)
  {
    element.webkitRequestFullscreen();
  }
  else if(element.msRequestFullscreen)
  {
    element.msRequestFullscreen();
  }

};

function exit_full_screen()
{
  if(document.exitFullscreen)
  {
    document.exitFullscreen();
  }
  else if(document.mozCancelFullScreen)
  {
    document.mozCancelFullScreen();
  }
  else if(document.webkitExitFullscreen)
  {
    document.webkitExitFullscreen();
  }

};
