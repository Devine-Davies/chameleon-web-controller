/*------------------------------------------------------
 * Cache Control
 ------------------------------------------------------
 • Need to add support for the user to attach there own data
   when a client that been saved
 ------------------------------------------------------
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function CacheControl( extend )
    {
        cwc.registerPlugin(this, 'CacheControl');

        /* -- Fetch any saved data -- */
        this.define_cwc_hooks();

        /* -- Fetch any saved data -- */
        this.fetch_storage_data();

        /* -- Check for old connections -- */
        this.delete_old_codes();
    };

    /*------------------------------------------------------
    * @string - Storage name
    * @info     - The name given to the local storage object
    */
    CacheControl.prototype.storage_name = 'cwc-cluster-cache';

    /*------------------------------------------------------
    * @int - Time Threshold
    * @info - declare how long data should live in local storage
    */
    CacheControl.prototype.time_threshold = 120;

    /*------------------------------------------------------
    * @object - Storage data
    * @info - Save the local storage object here
    */
    CacheControl.prototype.storage_data = {};

    /*------------------------------------------------------
    * @function - Define hooks
    * @info     - Set reserved hooks
    */
    CacheControl.prototype.define_cwc_hooks = function( )
    {
        /* -- Crete Hook for saving data -- */
        cwc.Hooks.prototype.set_hook( {
          hook_name : 'cwc:save-client-data',
          method    : function( feedback ) {
            cwc.CacheControl.prototype.save_cluster_code( feedback );
        } } );

    };

    /*------------------------------------------------------
    * @function - Fetch storage data
    * @info - Function to retrieve local storage data
    */
    CacheControl.prototype.fetch_storage_data = function()
    {
        if ( localStorage.getItem( this.storage_name ) !== null )
        {
            this.storage_data = JSON.parse(
                localStorage.getItem( this.storage_name )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Retrieve storage data
    * @info - function to get the local stage object
    */
    CacheControl.prototype.retrieve_storage_data = function()
    {
        return this.storage_data;

    };

    /*------------------------------------------------------
    * @function - Save connection information
    * @info - Called when a successful connection has been made to the server
    */
    CacheControl.prototype.save_cluster_code = function( client_data )
    {
        /* -- Check to see if the code has been saved -- */
        if( ! this.check_for_existence( client_data ) )
        {
            /* -- Formate the cluster code -- */
            this.storage_data[ client_data.key ] = client_data;

            /* -- Store -- */
            localStorage.setItem( this.storage_name , JSON.stringify(
              this.storage_data
            ) );
        }

    };

    /*------------------------------------------------------
    * @function - Delete old codes
    * @info - removes the old codes from the local storage
    */
    CacheControl.prototype.delete_old_codes = function()
    {
        var object     = this.storage_data;
        var new_object = {
        };

        for (var key in object )
        {
            var data = object[key];
            var diff = ( ( Date.now() - data.timestamp ) / 1000 / 60 ) << 0;

            /* -- Add if under : Time Threshold option -- */
            if( diff < this.time_threshold )
            {
                new_object[ key ] = object[ key ];
            }
        }

        this.storage_data = new_object;

    };

    /*------------------------------------------------------
    * @function - Check for existence
    * @info - Check to see if the code has been set
    */
    CacheControl.prototype.check_for_existence = function( client_data )
    {
        var object = this.storage_data;

        for ( var key in object )
        {
            if( object[ key ].cluster_code == cluster_code )
            {
                return true;
            }
        }

        return false;

    };

    /*------------------------------------------------------
    * @function
    * bind this object to the main object
    */
    cwc.plugin(CacheControl, 'CacheControl');

}( window.cwc );