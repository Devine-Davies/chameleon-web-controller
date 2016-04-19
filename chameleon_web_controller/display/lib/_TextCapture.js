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

        /* -- Set CWC hooks -- */
        this.set_cwc_hooks();

        /* -- Find elms -- */
        this.lookup();
    };

    /*------------------------------------------------------
    * @object - Groups & Items
    * @info - Keep and drecord of all found nav elms
    */
    TextCapture.prototype.all_text_capture = [
    ];

    /*------------------------------------------------------
    * @function - Set CWC hooks
    * @info - Set hook for Text Capture done from controller
    */
    TextCapture.prototype.set_cwc_hooks = function()
    {
        /* -- Crete connection fil | Hook -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:text-capture-done',
          method    : function( feedback ) {
            cwc.TextCapture.prototype.on_text_capture_done(
                feedback
            );
        } } );

    };

    /*------------------------------------------------------
    * @function - Text capture done
    * @info - Call when message has recived by server
    */
    TextCapture.prototype.on_text_capture_done = function( feedback )
    {
        console.log( this.all_text_capture[ feedback.name ] );
        this.all_text_capture[ feedback.name ].item.value = feedback.value;

    }

    /*------------------------------------------------------
    * @function - lookup
    * @info - Find elms with data-(textcapture) add the this to object
    */
    TextCapture.prototype.lookup = function()
    {
        /* -- Get names -- */
        var lookup       = document.querySelectorAll('[data-cwc-textcapture]');
        var lookup_count = lookup.length;

        for( var i = 0; i < lookup_count; i++ )
        {
            var name = lookup[ i ].dataset.cwcTextcapture;

            /* -- Listen out for event -- */
            lookup[ i ].addEventListener("focus", function(){
                cwc.TextCapture.prototype.run_on_controller(
                    this.dataset.cwcTextcapture
                );
            });

            /* -- Save the item -- */
            this.all_text_capture[ name ] = {
                item         : lookup[ i ],
                instructions : this.instructions( lookup[ i ] )
            };
        };

    };

    /*------------------------------------------------------
    * @function - Instructions
    * @info     - Check for any instructions bound to object
    */
    TextCapture.prototype.instructions = function( item )
    {
        var tax = 'data-cwc-instructions'

        /* -- Search for nav end inftructions-- */
        if( item.hasAttribute( tax )  )
        {
            return JSON.parse(
                item.getAttribute( tax )
            );
        }

        return null;

    };

    /*------------------------------------------------------
    * @function - Run on controller
    * @info - When invoked, call the controller
    */
    TextCapture.prototype.run_on_controller = function( name )
    {
        var placeholder = name;

        if( this.all_text_capture[ name ].instructions != null )
        {
            if( this.all_text_capture[ name ].instructions.hasOwnProperty( 'controller-placeholder' ) )
            {
                placeholder = this.all_text_capture[ name ].instructions['controller-placeholder'];
            }
        }

        Hooks.invoke_clinet_hook({
            recipient : 'controller',
            hook_name : 'text-capture-invoked',
            arguments : {
                name        : name,
                placeholder : placeholder
            }
        });

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(TextCapture, 'TextCapture');

}( window.cwc );