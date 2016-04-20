/*------------------------------------------------------
 * Viewport Scroll Display
 *------------------------------------------------------
 * To-Do
 -------------------------------------------------------
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
        this.set_cwc_hooks();

    };

    /*------------------------------------------------------
    * @function - lookup
    * @info - Find elms with data-(textcapture) add the this to object
    */
    TextCapture.prototype.set_cwc_hooks = function()
    {
        /* -- Crete connection fill | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:text-capture-invoked',
          method    : function( prams ) {
            cwc.TextCapture.prototype.create_text_capture(
                prams
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Create text capture
    * @info - Append a text capture item to the DOM
    */
    TextCapture.prototype.create_text_capture = function( prams )
    {
        /* -- Check elm dose not exist -- */
        if ( ! document.querySelector('#' + prams.name ) )
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

    };

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Called when the user has finished inputting text
    */
    TextCapture.prototype.text_capture_done = function( elm )
    {
        /* -- Remove element -- */
        document.body.removeChild( elm );

        /* -- Send the recorded data -- */
        cwc.Hooks.prototype.invoke_clinet_hook({
            hook_name : 'text-capture-done',
            recipient : 'display',
            arguments : {
                name  : elm.id,
                value : elm.value
            }
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TextCapture, 'TextCapture');

}( window.cwc );