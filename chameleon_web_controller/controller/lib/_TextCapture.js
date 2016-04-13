/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
 • Fix support for scroll animation on tap.
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function TextCapture( )
    {
        cwc.registerPlugin(this, 'TextCapture');

        /* -- Set the hooks -- */
        this.set_hooks();
    };

    /*------------------------------------------------------
    * @function - lookup
    * @info - Find elms with data-(textcapture) add the this to object
    */
    TextCapture.prototype.set_hooks = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_reserved_hook( {
          name      : 'text-capture-invoked',
          method    : function( prams ) {
            cwc.TextCapture.prototype.create_text_capture(
                prams
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Create text capture
    * @info - Append a text captrue item to the DOM
    */
    TextCapture.prototype.create_text_capture = function( prams )
    {
        var input = document.createElement("textarea");
            input.maxLength = "5000";
            input.cols = "80";
            input.rows = "40";
            input.className  = 'cwc-text-capture';
            input.placeholder = prams.placeholder;

            /* -- Use the name as #id -- */
            input.id = prams.name;

            input.addEventListener("blur", function(){
                cwc.TextCapture.prototype.text_capture_done( this );
            });

        /* -- Add to the body -- */
        document.body.appendChild(input);

        /* -- Focus into the elm -- */
        document.querySelector('#' + name ).focus();
    }

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Called when the user has finshed inputing text
    */
    TextCapture.prototype.text_capture_done = function( elm )
    {
        /* -- Remove elment -- */
        document.body.removeChild( elm );

        /* -- Send the recorded data -- */
        cwc.Server.prototype.send_message({
            action    : 'text-capture-done',
            recipient : 'display',
            arguments : {
                name  : elm.id,
                value : elm.value
            }
        });

    }

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TextCapture, 'TextCapture');

}( window.cwc );