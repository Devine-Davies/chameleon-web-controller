/* -- Adress sent from index.html -- */
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
    cwc_object_declaration();
    controller_code();
    start_conection_process();

};

function cwc_object_declaration()
{
    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    ClusterCodeCache = new cwc.ClusterCodeCache({
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
    CustomMethod = new cwc.CustomMethod({
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

function controller_code()
{
    var is_sending = null;

    CustomMethod.create_method( {
      name   : 'on-move-navigation',
      method : function( prams ) {
        //console.log( prams );
        if( prams.in_out.x == 'out' || prams.in_out.y == 'out' )
        {
            slow_down( prams.cardinal_direction );
        }
      }
    });

    CustomMethod.create_method( {
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

        $('#connect-code-list li').on('click', function(){
            /* -- Run cwc server object to connect to server with code -- */
            Server.connect(
                $(this).text()
            );
        });

    }

    $('#connect-button').on('click', function(){
        /* -- Run cwc server object to connect to server with code -- */
        Server.connect(
            $('#cluster-code').val()
        );

    });

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


