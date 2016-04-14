/* ------------------------------
*  Chameleon Web Controller
*  - Server Master

   - MIT License
   - Copyright (c) 2016 Chameleon Web Controller

   - Permission is hereby granted, free of charge, to any person obtaining a copy
   - of this software and associated documentation files (the "Software"), to deal
   - in the Software without restriction, including without limitation the rights
   - to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   - copies of the Software, and to permit persons to whom the Software is
   - furnished to do so, subject to the following conditions:

   - The above copyright notice and this permission notice shall be included in all
   - copies or substantial portions of the Software.

   - THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   - IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   - FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   - AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   - LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   - OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   - SOFTWARE.
*/

/*------------------------------------------------------
* -- Centralised --
*/
//@codekit-append "../../centralised/_Functions.js";

/*------------------------------------------------------
* -- Server --
*/
//@codekit-append "_Server.js"

/* ------------------------------
*  Coding standerds !
*  ------------------------------
*  _ = private vars & functons
*/
!function() {
"use strict";

    var cwc = {

        /* ------------------------------------------------------
        * Set type of plugin
        */
        _cwc_type : 'server',

        /* ------------------------------------------------------
        * Stores initialized plugins.
        */
        _plugins: {},

        /* ------------------------------------------------------
        * Stores generated unique ids for plugin instances
        */
        _uuids: [],

        /* ------------------------------------------------------
        * Stores currently active plugins.
        */
        _activePlugins: {},

        /* ------------------------------------------------------
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
        plugin: function(plugin, name) {
            // Object key to use when adding to global Foundation object
            // Examples: Foundation.Reveal, Foundation.OffCanvas
            var className = (name || functionName(plugin));
            // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
            // Examples: data-reveal, data-off-canvas
            var attrName  = hyphenate(className);

            // Add to the Foundation object and the plugins list (for reflowing)
            this._plugins[attrName] = this[className] = plugin;
        },

        /*------------------------------------------------------
        * @function
        * Creates a pointer to an instance of a Plugin within the Foundation._activePlugins object.
        * Sets the `[data-pluginName="uniqueIdHere"]`, allowing easy access to any plugin's internal methods.
        * Also fires the initialization event for each plugin, consolidating repeditive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#init
        */
        registerPlugin: function(plugin, name){
            var pluginName  = name ? hyphenate(name) : functionName( plugin.constructor ).toLowerCase();
                plugin.uuid = this.GetYoDigits(6, pluginName);

            this._uuids.push(plugin.uuid);

            return;
        },

        /*------------------------------------------------------
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
        GetYoDigits: function(length, namespace){
            length = length || 6;
            return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1) + (namespace ? '-' + namespace : '');
        },

    };

    /* -- Bound out object to the window -- */
    module.exports.cwc = cwc;

}( );