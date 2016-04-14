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
          rand_color_got( feedback,  mdata );
        }
    });

    Hooks.set_hook( {
        hook_name : 'on-analog-move',
        method    : function( feedback, mdata ) {
          on_analog_move( feedback, mdata );
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
    heros[ mdata.key ].y += feedback.y * 10;
    heros[ mdata.key ].x += feedback.x * 10;
}

function connect_to_server()
{
    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'connection-success',
      method    : function( feedback ) { on_connect( feedback ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'connection-failed',
      method    : function( feedback ) { console.log( data ); }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'controller-connected',
      method    : function( controller ) { controller_connected( controller ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'controller-disconnected',
      method    : function( controller ) { controller_disconnected( controller ) }
    } );

    Hooks.set_hook( {
      hook_name   : 'gn-item-selected',
      method : function( feedback ) {
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
    $( '#controller-connection-alert h2' ).text('Welcome controller');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    for( var i = 0; i < controllers.length; i++ )
    {
        var hero_key = controllers[ i ].key;

        if( ! ( hero_key in heros ) )
        {
            heros[ hero_key ] = jQuery.extend(true, {}, hero);
        }
    }

    /* -- Save the contrrolers -- */
    _controllers = controllers;

    show_controller_tally( controllers );

}

function controller_disconnected( controllers )
{
    var speed = 1000;
    $( '#controller-connection-alert h2' ).text('Controler disconnected');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    if( controllers.length == 0 )
    {
        heros = {};
    }

    for( var i = 0; i < controllers.length; i++ )
    {
        var hero_key = controllers[ i ].key;

        if( _controllers.indexOf( hero_key ) == -1 )
        {
            console.log('here');
            delete heros[ hero_key ]
        }
    }

    show_controller_tally( controllers );

}

function show_controller_tally( controllers )
{
    var count = 0;

    for( var i = 0; i < controllers.length; i++ )
    {
        count++;
    }

    $('.top-bar .controller-tally p span').text(
        count
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
