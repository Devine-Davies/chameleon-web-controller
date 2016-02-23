/*------------------------------------------------------
* @function in array
* System messages should be declared here
* We will have a list or predefined functions
*/
var server = new cwc.Server({
    host : '100.76.5.36',
    port : 5000,
    type : 'ws'
});


/*------------------------------------------------------
* @function in array
* System messages should be declared here
* We will have a list or predefined functions
*/
// var server_method = new cwc.ServerMethod({ });
// server_method.create_method('first_screen_connected', function( prams ){
//         console.log('first screen is connected!');
// });



window.onload = function() {

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    var navigation = new cwc.Navigation({
      classes : {
          group : 'custom_class_name',
          item  : 'custom_class_name',
      },

      callbacks : {
          /* -- System -- */
          onnav_changed  : function( info ){  },
          onitem_changed : function( info ){  }
      }
   });

    /*------------------------------------------------------
    * @function in array
    * System messages should be declared here
    * We will have a list or predefined functions
    */
    var custom_method = new cwc.CustomMethod({ });
    custom_method.create_method( {
        name   : 'on-item-enter',
        method : function( info ) {
          console.log(info );
        }
    });

};




































