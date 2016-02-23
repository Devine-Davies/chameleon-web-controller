!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ServerMessages(  )
    {
        /* -- Add to plugins -- */
        cwc.registerPlugin(ServerMessages, 'ServerMessages');

        /* -- Created the methord to recive hello event -- */
        cwc.ServerMessages.prototype.say_hello_to_server()
    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    ServerMessages.prototype.say_hello_to_server = function()
    {
        /* -- Created the methord to recive hello event -- */
        cwc.ServerMethod.prototype.create_method({
            action   : 'client says hello',
            callback : function( args ){
                cwc.Server.prototype.set_client_type( args )
            }
        } );
    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(ServerMessages, 'ServerMessages');

    cwc.ServerMessages( );

}( module.exports.cwc );