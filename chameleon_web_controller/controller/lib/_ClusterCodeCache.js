/*------------------------------------------------------
 * To-Do
 ------------------------------------------------------
 • Add support for data attr nav dir - up, down, left, right
 • Add support for NO end last and first attr
 • Add support for Enter key for on select
 • Must show testing on Screen
 • Add commit
 ------------------------------------------------------
 • Start D-pad
*/

!function( cwc ){
  'use strict';

    /*------------------------------------------------------
    * @function
    */
    function ClusterCodeCache( extend )
    {
        cwc.registerPlugin(this, 'ClusterCodeCache');

        /* -- Fetch any saved data -- */
        this.fetch_storage_data();

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.storage_name = 'cwc-cluster-cache';

    /*------------------------------------------------------
    * @function - Time request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.time_threshold = 120;

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.storage_data = {};

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.fetch_storage_data = function()
    {
        if ( localStorage.getItem( this.storage_name ) !== null )
        {
            this.storage_data = JSON.parse(
                localStorage.getItem( this.storage_name )
            );
        }

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.retrieve_storage_data = function()
    {
        return this.storage_data;

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.save_cluster_code = function( cluster_code, cwc_type )
    {
        /* -- remove old code from local data -- */
        this.delete_old_codes();

        /* -- Check to see if the code has been saved -- */
        if( ! this.dose_cose_exists( cluster_code ) )
        {
            /* -- Formate the cluster code -- */
            this.storage_data[ Date.now() ] = {
                cluster_code : cluster_code,
                cwc_type     : cwc_type,
            };

            /* -- Store -- */
            localStorage.setItem( this.storage_name , JSON.stringify(
              this.storage_data
            ) );
        }

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.delete_old_codes = function()
    {
        var object     = this.storage_data;
        var new_object = {
        };

        for (var key in object )
        {
            if ( object.hasOwnProperty( key ) )
            {
                var diff = ( ( Date.now() - key ) /1000/60) << 0;

                /* -- Add if underd : Time Threshold option -- */
                if( diff < this.time_threshold )
                {
                    new_object[ key ] = object[ key ];
                }
            }
        }

        this.storage_data = new_object;

    };

    /*------------------------------------------------------
    * @function - Process request
    * @info - Send the message to the right clinet
    */
    ClusterCodeCache.prototype.dose_cose_exists = function( cluster_code )
    {
        var object = this.storage_data;

        for (var key in object )
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
    cwc.plugin(ClusterCodeCache, 'ClusterCodeCache');

}( window.cwc );