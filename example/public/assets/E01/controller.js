/* -- Adress sent from index.html -- */
var seed = window.location.search.substring(window.location.search.indexOf('seed=') + 5);
if (seed.indexOf('&') >= 0) {
  seed = seed.substring(0, seed.indexOf('&'));
}

document.ontouchmove = function(event){
    event.preventDefault();
}


/*------------------------------------------------------
* @function in array
* System messages should be declared here
* We will have a list or predefined functions
*/
window.onload = function()
{
    cwc_object_declaration();
    cwc_hooks();
    start_conection_process();
    controller_swittcher();
    trailler_buttons();

};

function cwc_object_declaration()
{
    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    ClusterCodeCache = new cwc.CacheControl({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Server = new cwc.Server({
        host         : seed || 'http://localhost:5000/',
        port         : 5000,
        type         : 'ws'
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Textcapture = new cwc.TextCapture({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    Hooks = new cwc.Hooks({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    ControllerMaster = new cwc.ControllerMaster({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    QuickButtons = new cwc.QuickButtons({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    DPad = new cwc.DPadController({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    GesturePad = new cwc.GesturePadController({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    AnalogPad = new cwc.AnalogController({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    PullbarController = new cwc.PullbarController({
    });

};

var is_sending = null;

function cwc_hooks()
{
    Hooks.set_hook( {
      hook_name : 'on-move-navigation',
      method    : function( prams ) {
        controller_active( prams );
      }
    });

    Hooks.set_hook( {
      hook_name : 'trailler-active',
      method    : function( traille_title ) {
        show_trailler_buttons( traille_title );
      }
    });

};


function controller_active( prams )
{
    if( prams.controller == 'GesturePadController' )
    {
        if( prams.axis_direction.x == 'in' || prams.axis_direction.y == 'in' )
        {
            return;
        }
    }

    if ( ! prams.compass_rose.includes('NE NW SE SW') )
    {
        Hooks.invoke({
            hook_name : 'd-hook:move-navgroup',
            arguments : prams.compass_rose
        });
    }

}

function start_conection_process()
{
    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name  : 'connection-success',
      method    : function( feedback ) { on_connect( feedback ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name  : 'connection-failed',
      method    : function( feedback ) { console.log( feedback ); }
    } );

    if( ClusterCodeCache.retrieve_storage_data() )
    {
        var object =  ClusterCodeCache.retrieve_storage_data();
        var html   = '';

        for (var key in object )
        {
            html += '<li>' + object[ key ].cluster_code + '</li>';
        }

        $('#connect-code-list').html( html );

        /* -- Run cwc server object to connect to server with code -- */
        $('#connect-code-list li').on('click', function() {
            Server.connect( $(this).text() );
        } );

    }

    $('#connect-code').on('focusout', function(){
        /* -- Run cwc server object to connect to server with code -- */
        Server.connect( $('#connect-code').val() );
    } );

};

function on_connect()
{
    console.log('on_connection_sucsess');
    $('.connect-code-process').removeClass('open');

};

function on_connection_faild()
{
    console.log('on_connection_faild');
    $('.connect-code-process').addClass('open');

};

function controller_swittcher ()
{
    $('.controler-swap button').on('click', function(){
        $('body').removeClass( 'swip-pad-swap analog-pad-swap dpad-swap' );
        $('body').addClass( $( this ).attr('class') );
    });
}


function show_trailler_buttons( traille_title )
{
    $('body').toggleClass('traille-buttons')
    $('#traille-title').text( traille_title );
}

function trailler_buttons()
{
    $('.traille-buttons .exit').on('click', function(){
        show_trailler_buttons();
    });
}