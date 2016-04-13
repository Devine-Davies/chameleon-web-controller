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
    cwc_Hooks();
    start_conection_process();

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
    textcapture = new cwc.TextCapture({
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
    DPad = new cwc.DPadController({
    });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    TouchPad = new cwc.TouchPadController({
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

function cwc_Hooks()
{
    Hooks.set_hook( {
      name   : 'on-move-navigation',
      method : function( prams ) {
        //console.log( prams );
        if( prams.in_out.x == 'out' || prams.in_out.y == 'out' )
        {
            slow_down( prams.cardinal_direction );
        }
      }
    });

    Hooks.set_hook( {
      name   : 'scroll-view',
      method : function( prams ) {
        Server.send_message({
            recipient : 'display',
            action    : 'scroll-viewport',
            arguments : {
              viewport_target : 'scroll-target',
              direction       : (prams.cardinal_direction.indexOf('N') > -1 )? 'up' : 'down',
              ammount         : 15,
              type            : 'scroll to'
            }
        });
      }
    });

}

function start_conection_process()
{
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
            Server.connect({
               'connect-code'       : $(this).text(),
               'connection-sucsess' : function(){ on_connection_sucsess() },
               'connection-failed'  : function(){ on_connection_faild()   }
            } );
        } );

    }

    $('#connect-code').on('focusout', function(){
        /* -- Run cwc server object to connect to server with code -- */
        Server.connect({
           'connect-code'       : $('#connect-code').val(),
           'connection-sucsess' : function(){ on_connection_sucsess() },
           'connection-failed'  : function(){ on_connection_faild()   }
        } );
    } );
}

function on_connection_sucsess()
{
    console.log('on_connection_sucsess');
    $('.connect-code-process').removeClass('open');
}

function on_connection_faild()
{
    console.log('on_connection_faild');
    $('.connect-code-process').addClass('open');
}

function slow_down( dir )
{
    if ( ! this.is_sending )
    {
        is_sending = true;

        setTimeout( function(){
            Server.send_message({
                recipient : 'display',
                action    : 'move navigation',
                arguments : dir
            });

          is_sending = false;
        } , ( 150 ) );
    }

};