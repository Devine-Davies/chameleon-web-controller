
var seed = window.location.search.substring(window.location.search.indexOf('seed=') + 5);
if (seed.indexOf('&') >= 0) {
    seed = seed.substring(0, seed.indexOf('&'));

}

_fake_api = {
    'top_movies' : _example_feed,
    'action'     : _example_feed,
    'adventure'  : _example_feed,
    'comedy'     : _example_feed
};

_current_feed = {
}

_nav_moves = [];
_audio     = new Audio('sounds/pop_drip.wav');

/*------------------------------------------------------
* @function in array
* System messages should be declared here
* We will have a list or predefined functions
*/
window.onload = function()
{
    /* -- load -- */
   load_movie_images( );

    /* -- Build our cwc objects -- */
    cwc_object_declaration();

    /* -- Connect to the server -- */
    connect_to_server();

    /* -- to make full screen -- */
    $(document).on('click', function(){
        //launch_into_fullscreen( document.documentElement );
    })

};

function load_movie_images( )
{
    $('body.display #top-nav .align .navigation section:first-child').addClass('active');

    var html  = '';
    var ng    = 2;
    var count = 0;

    for ( var key in _fake_api )
    {
        var instructions = {
          'down'          : 'ng-next',
          'up'            : 'ng-prev',
          'right'         : 'ni-next',
          'left'          : 'ni-prev',
          'history-item'  : 'true',
          'onnaventrance' : 'hook-move-page-onentrance',
        };

        if( count == Object.keys(_fake_api).length - 1 )
        {
            instructions['down'] = 'ng-prev';
        }

        html +="<h2>" + key.replace('_', ' ') + "</h2>";
        html +='<section class="section-list" ';
        html +='data-cwc-navgroup="' + (ng++) + '" ';
        html +='data-cwc-instructions=' + JSON.stringify( instructions ) + '>';

        $( _fake_api[ key ] ).each( function( i, data )
        {
            if( i > 5 ) { return; }

            var img     = data.image;
            var overide = {
              'enter'        : 'hook-movie-item-selected',
            };

            html += '<div class="item" data-cwc-navitem ';
            html += 'data-cwc-overide=' + JSON.stringify( overide ) + ' ';
            html += 'style="background-image:url(' + img + ')"';
            html += 'data-feed-info="' + key + ':' + i + '" >';
            html += '</div>';
        });

        html += '</section>';

        count++;

    }

    $('.item-list').html( html );

};

function cwc_object_declaration()
{
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
      callbacks : {
          onnav_changed  : function( feedback ){
            // console.log( feedback );
            _nav_moves.push( feedback.g_name )
          },

          onitem_changed : function( feedback ) {
            // console.log( feedback );
            _audio.play();
          }
      }
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    textcapture = new cwc.TextCapture({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Hooks = new cwc.Hooks({ });

    Hooks.set_hook( {
        name   : 'gn-item-selected',
        method : function( feedback ) {
        }

    });

    Hooks.set_hook( {
        name   : 'on-global-nav-enter',
        method : function( feedback ) {
          move_page( feedback );
          $( '#top-nav .navigation section.active' ).removeClass('active');
          $( feedback.i_elm.item ).addClass('active');
        }
    });

    Hooks.set_hook( {
        name   : 'movie-item-selected',
        method : function( feedback ) {
            loade_data_feed( $( feedback.i_elm.item ).data('feed-info') );
        }
    });

    Hooks.set_hook( {
        name   : 'load-movie-window',
        method : function( feedback ) {
            open_trailler_window(  );
        }
    });

    Hooks.set_hook( {
        name   : 'info-window-btn-clicked',
        method : function( feedback ) {
            info_window_btn_clicked( feedback );
        }
    });

    Hooks.set_hook( {
        name   : 'on-search-focus',
        method : function( feedback ) {
            textcapture.run_on_controller('cwc-textcapture-search');
        }
    });

    Hooks.set_hook( {
        name   : 'move-page-onentrance',
        method : function( feedback ) {
            move_page( feedback );
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

function move_page( info )
{
    /* -- Find the offset to move to -- */
    var offset = $( info.g_elm ).offset();
    $("#scroll-target").animate({ scrollTop: offset.top - 200 });

    /* -- Save the move -- */
    _nav_moves.push( info.g_id );
}

function loade_data_feed( feed )
{
    feed = feed.split(':');

    /* -- Set the global var -- */
    _current_feed = _fake_api[ feed[ 0 ] ][ feed[ 1 ] ];

    $('#infromation-side-screen .info .left img')[0].src = _current_feed.image;
    $('#infromation-side-screen').fadeIn( 500 );

    /* -- Move onto the loaded data feed window -- */
    navigation.move_to_nav_name( 'infromation-screen' );

};

function info_window_btn_clicked( feedback )
{
    /* -- Close the window -- */
    if( feedback.i_elm.item.innerHTML == 'Exit' )
    {
        $('#infromation-side-screen').css({ 'display' : 'none' });
        navigation.move_to_nav_name( _nav_moves[ _nav_moves.length - 2 ] );
    }

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

};

function on_connect( data )
{
    $('.connection-code p span').text(
        data.metadata.cluster_code
    );

};

function controller_connected( controllers )
{
    var speed = 1000;
    $( '#controller-connection-alert h2' ).text('Welcome controller');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    show_controller_tally( controllers );

};

function controller_disconnected( controllers )
{
    var speed = 1000;
    $( '#controller-connection-alert h2' ).text('Controler disconnected');
    $( '#controller-connection-alert' ).fadeIn( speed , function(){
       $(this).fadeOut( ( speed / 2 ),  function(){ });
    });

    show_controller_tally( controllers );

};

function show_controller_tally( controllers )
{
    var count = 0;

    for( var i = 0; i < controllers.length; i++ ) {
        count++;
    }

    $('.controller-tally p span').text(
        count
    );

};

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
