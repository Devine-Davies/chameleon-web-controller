
var seed = window.location.search.substring(window.location.search.indexOf('seed=') + 5);
if (seed.indexOf('&') >= 0) {
    seed = seed.substring(0, seed.indexOf('&'));

}

_fake_api = {
    'My Faviourts' : _example_feed,
    'action'     : _example_feed,
    'adventure'  : _example_feed,
    'Sci Fi'     : _example_feed,
    'comedy'     : _example_feed,
    'technology' : _example_feed
};

_current_feed = {
}

_nav_moves = [];
_audio     = new Audio('http://rcptones.com/dev_tones/tones/click_04.wav');

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
       // launch_into_fullscreen( document.documentElement );
    })

};

function load_movie_images( )
{
    $('body.display #top-nav .align .Navgroup section:first-child').addClass('active');

    var html  = '';
    var ng    = 2;
    var count = 0;

    for ( var key in _fake_api )
    {
        var instructions = {
          'down'          : 'ng:next',
          'up'            : 'ng:prev',
          'right'         : 'ni:next',
          'left'          : 'ni:prev',
          'history-item'  : 'true',
          'on-entrance'   : 'hook:scroll-page',
        };

        if( count == Object.keys(_fake_api).length - 1 )
        {
            instructions['down'] = 'ng:prev';
        }

        html +="<h2>" + key.replace('_', ' ') + "</h2>";
        html +='<section class="section-list" ';
        html +='data-cwc-navgroup="' + (ng++) + '" ';
        html +='data-cwc-instructions=' + JSON.stringify( instructions ) + '>';

        // shuffle( _fake_api[ key ] );

        $( _fake_api[ key ] ).each( function( i, data )
        {
            if( i > 5 ) { return; }

            var img     = data.image;
            var overide = {
              'enter'        : 'hook:movie-item-selected',
            };

            html += '<div class="item" data-cwc-navitem ';
            html += 'data-cwc-instructions=' + JSON.stringify( overide ) + ' ';
            html += 'style="background-image:url(' + img + ')"';
            html += 'data-feed-info="' + key + ':' + i + '" >';
            html += '</div>';
        });

        html += '</section>';

        count++;

    }

    $('.item-list').html( html );

};

function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

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
    Hooks = new cwc.Hooks({ });

    /* -- On navgroup update -- */
    Hooks.set_hook( {
      hook_name : 'navgroup-updated',
      method    : function( tracking ) { _nav_moves.push( tracking.g_name ); }
    } );

    /* -- On item update -- */
    Hooks.set_hook( {
      hook_name : 'navitem-updated',
      method    : function( tracking ) {  _audio.play();  }
    } );

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Navgroup = new cwc.Navgroup({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    textcapture = new cwc.TextCapture({
    });


    Hooks.set_hook( {
        hook_name : 'on-global-nav-enter',
        method    : function( feedback ) {
          move_page( feedback );
          $( '#top-nav .Navgroup section.active' ).removeClass('active');
          $( feedback.i_elm.item ).addClass('active');
        }
    });

    Hooks.set_hook( {
        hook_name   : 'movie-item-selected',
        method : function( feedback ) { loade_data_feed( $( feedback.i_elm.item ).data('feed-info') ); }
    });

    Hooks.set_hook( {
        hook_name   : 'info-window-btn-clicked',
        method : function( feedback ) { info_window_btn_clicked( feedback ); }
    });

    Hooks.set_hook( {
        hook_name   : 'video-button-invoked',
        method : function( feedback ) { video_button_invoked( feedback ); }
    });

    Hooks.set_hook( {
        hook_name   : 'play-trailler',
        method : function( feedback ) {
          $('#popup-youtube-player')[0].contentWindow.postMessage('{"event":"command","func":"' + 'playVideo' + '","args":""}', '*');
        }
    });

    Hooks.set_hook( {
        hook_name   : 'pasue-trailler',
        method : function( feedback ) {
          $('#popup-youtube-player')[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
        }
    });

    Hooks.set_hook( {
        hook_name   : 'exit-trailler',
        method : function( feedback ) { close_info_window(); }
    });


    Hooks.set_hook( {
        hook_name   : 'on-search-focus',
        method : function( feedback ) { textcapture.run_on_controller('cwc-textcapture-search'); }
    });

    Hooks.set_hook( {
        hook_name   : 'scroll-page',
        method : function( feedback ) { scroll_page( feedback ); }
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

function scroll_page( info )
{
    /* -- Find the offset to move to -- */
    var offset = $( info.g_elm ).offset();
    $("body").animate({ scrollTop: offset.top - 200 });

    /* -- Save the move -- */
    _nav_moves.push( info.g_id );

};

function loade_data_feed( feed )
{
    feed = feed.split(':');

    /* -- Set the global var -- */
    _current_feed = _fake_api[ feed[ 0 ] ][ feed[ 1 ] ];


    $('#infromation-side-screen .info .left').css("background-image", "url("+ _current_feed.image +")" );
    $('#scroll-target').html( "<p>" + _current_feed.info + " </p >" + "<p>" + _current_feed.info + " </p >" );
    $('#infromation-side-screen').fadeIn( 500 );

    /* -- Move onto the loaded data feed window -- */
    Navgroup.move_to_nav_name( 'infromation-screen' );

};

function info_window_btn_clicked( feedback )
{
    if( feedback.i_elm.item.innerHTML == 'Exit' )
    {
        close_info_window();
        $('#popup-youtube-player')[0].contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
    }

    else if( feedback.i_elm.item.innerHTML == 'Trailler' )
    {

        /* -- Close the window -- */
        $('#infromation-side-screen').css({ 'display' : 'none' });

        /* -- Open movie window -- */
        $('#movie-window').css({ 'display' : 'block' });

        /* -- Let the controller know-- */
        Hooks.invoke({
            hook_name : 'c-hook:trailler-active',
            arguments : _current_feed.title
        });

        $('#popup-youtube-player').attr('src', url );

        loade_youtube_video ( _current_feed.yt_video_code );
    }

};

function close_info_window()
{
    /* -- Close the window -- */
    $('#infromation-side-screen').css({ 'display' : 'none' });

    /* -- Close movie window -- */
    $('#movie-window').css({ 'display' : 'none' });

    /* -- Move back to preivous nav -- */
    Navgroup.move_to_nav_name( _nav_moves[ _nav_moves.length - 2 ] );
}

function close_video_window( feedback )
{
  $('#movie-window').css({ 'display' : 'none' });
  $("#trailler-video").get(0).pause();
}

function connect_to_server()
{
    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'connection-success',
      method    : function( feedback ) {
        on_connect( feedback )
      }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'connection-failed',
      method    : function( feedback ) { console.log( data ); }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'cwc:controller-connected',
      method    : function( controller ) { controller_connected( controller ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name      : 'cwc:controller-disconnected',
      method    : function( controller ) { controller_disconnected( controller ) }
    } );

    Hooks.set_hook( {
      hook_name   : 'gn-item-selected',
      method : function( feedback ) { }
    });

    /* -- connect to the host via web sockets -- */
    server.connect(  );

};

function on_connect( data )
{
    $('.connection-code p span').text(
        data.cluster_code
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
    var html     = '';

    $( $('.controller-tally i') ).each( function (){
        /* -- add the new cwc to  the new elms -- */
        Navgroup.ng_remove_item(
            this , 'controller-tally'
        );
    });

    for( var i = 0; i < controllers.length; i++ )
    {
        if( i == 0 )
        {
          html += '<i class="fa fa-gamepad" aria-hidden="true" data-cwc-navitem ';
          html += "data-cwc-instructions='{ \"left\" : \"ng-search\"}' ";
          html += '></i>';
        }
        else
        {
          html += '<i class="fa fa-gamepad" aria-hidden="true" data-cwc-navitem';
          html += '></i>';
        }

    }

    /* -- Add to the dom -- */
    $('.controller-tally').html( html );

    $( $('.controller-tally i') ).each( function (){
        /* -- add the new cwc to  the new elms -- */
        Navgroup.ng_append_item(
            this , 'controller-tally'
        );
    });

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



// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;


var loade_youtube_video = function( video_code )
{
  var url = 'http://www.youtube.com/embed/' + video_code + '?enablejsapi=1&version=3&playerapiid=ytplayer';
  $('#popup-youtube-player').attr('src', url );
}


// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}


function stopVideo() {
  player.stopVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}