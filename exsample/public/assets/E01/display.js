var seed = window.location.search.substring(window.location.search.indexOf('seed=') + 5);
if (seed.indexOf('&') >= 0) {
    seed = seed.substring(0, seed.indexOf('&'));
}

var audio = new Audio('assets/sounds/pop_drip.wav');

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
        launch_into_fullscreen( document.documentElement );
    })
};

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

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    navigation = new cwc.Navigation({
      classes : {
          group : 'custom_class_name',
          item  : 'custom_class_name',
      },

      callbacks : {
          /* -- System -- */
          onnav_changed  : function( info ){
            console.log( info );
          },
          onitem_changed : function( info ){
              audio.play();
          }
      }
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Hooks = new cwc.Hooks({ });
    Hooks.set_hook( {
        name   : 'on-item-enter',
        method : function( info ) {
          console.log(info );
        }
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    viewportScroll = new cwc.ViewportScroll([
      '#scroll-target'
    ]);

};

function connect_to_server()
{
    /* -- connect to the host via web sockets -- */
    server.connect({
      'connection-sucsess'      : function ( data ){ on_connect( data ) },
      'connection-failed'       : function ( data ){ console.log( data ); },
      'controller-connected'    : function ( controller ){ controller_connected( controller );    },
      'controller-disconnected' : function ( controller ){ controller_disconnected( controller ); }
    });
}

function on_connect( data )
{
    $('.top-bar .connection-code p span').text(
        data.metadata.cluster_code
    );
}

function controller_connected( controllers )
{
    var speed = 1000;
    $( '#controller-connection-alert h2' ).text('Welcome controller');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    show_controller_tally( controllers );

}

function controller_disconnected( controllers )
{
    var speed = 1000;
    $( '#controller-connection-alert h2' ).text('Controler disconnected');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    show_controller_tally( controllers );

}

function show_controller_tally( controllers )
{
    var count = 0;

    for( var i = 0; i < controllers.length; i++ ) {
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

}

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

}






