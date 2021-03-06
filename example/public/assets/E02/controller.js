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
    start_conection_process();

};

function cwc_object_declaration()
{
    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    CacheControl = new cwc.CacheControl({
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
    AnalogPad = new cwc.AnalogController({
    });

};

var is_sending = null;


function start_conection_process()
{
    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name  : 'connection-success',
      method    : function( feedback ) { on_connection_sucsess( feedback ) }
    } );

    /* -- Crete connection sucsess | Hook -- */
    Hooks.set_hook( {
      hook_name  : 'connection-failed',
      method    : function( feedback ) { console.log( feedback ); }
    } );

    if( CacheControl.retrieve_storage_data() )
    {
        var object =  CacheControl.retrieve_storage_data();
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

}

function on_connection_sucsess()
{
    $('.connect-code-process').removeClass('open');

    /* -- Send the random color -- */
    Hooks.invoke({
        hook_name : 'd-hook:rand-color',
        arguments : getRandomColor()
    });

}

function getRandomColor()
{
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    update_controller_style( color );

    return color;
}

function update_controller_style( color )
{
    $('[data-cwc-controller="analog"].cwc-style').css({ 'border-color' : color })

    // Create a new style tag
    var style = document.createElement("style");
    // Append the style tag to head
    document.head.appendChild(style);
    // Grab the stylesheet object
    sheet = style.sheet;
    // Use addRule or insertRule to inject styles
    sheet.addRule(
        '[data-cwc-controller="analog"].cwc-style span:after ',
        'background-color: '+ color +' '
    );
}


function on_analog_move( prams )
{
    /* -- Send the random color -- */
    Hooks.invoke_clinet_hook({
        recipient : 'display',
        hook_name : 'on-analog-move',
        arguments : prams
    });

}