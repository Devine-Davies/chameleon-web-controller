---
layout: feature-doc
title:  "Analog controller"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

this_obj     : "`cwc.PullbarController({})`"

f_image      : "/images/a-pad@2x.png"
categories   : components
tax          : controller
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
<!--more-->

![alt text]( /images/a-pad-2@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad@2x.png "Logo Title Text 1")

#### Simple html sample
Elements with an `data-cwc-controller="analog"` attribute applied to them will be treated as an Analog component by the **cwc** object.

Add a the cwc style to your {{ page.title }} with the `.cwc-style` class.

{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"  >
  <span></span>
</div>
{% endhighlight %}

#### JavaScript Declaration
`cwc.ControllerMaster({})` must be included and the {{ page.this_obj }} has to be initiated after the DOM has finshed loading.

{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
var ControllerMaster = new cwc.ControllerMaster({
});

window.onload = function() {
    /*------------------------------------------------------
    * @object - CWC Main AnalogController Object
    * @info   - initiate CWC AnalogController Object
    */
    AnalogPad = new cwc.AnalogController({
    });
};
{% endhighlight %}

## {{ page.title }} Instructions
Additional settings can be added to each {{ page.title }} through the use of the `data-cwc-instructions` data attrabute.

| Properties    | Type    | Vales                                                |
| ------------- | ------- | --------------                                       |
| movement-type | String  | pan or touch                                         |
| on-movment    | Hook    | The hook name created on the client wish to invoke   |

[comment]: <> (--------------------------------------------------------------------------------------------------------)
[comment]: <> (--------------------------------------------------------------------------------------------------------)

## {{ page.title }} movement types
You can change the way the user intracts with the {{ page.title }} by setting the `movement-type` property within the data instructions attribute.

| Properties    | Type    | Vales             |
| ------------- | ------- | --------------    |
| movement-type | String  | pan or touch      |

#### **Pan**
You can spesify a Hook to be called for when the user is interacting with the {{ page.title }}. Mutipal {{ page.title }}'s can be defined in one document.

#### **Touch**
You can spesify a Hook to be called for when the pull bar is pulling by providing an on-pull parameter within the. Mutipal Pullbars can be set in one document.

[comment]: <> (--------------------------------------------------------------------------------------------------------)
[comment]: <> (--------------------------------------------------------------------------------------------------------)

## On movment
You can spesify a Hook to be called for when the component is moving, by defining a hook the the on `on-movement` parameter within the components instructions attribute.

| Properties    | Type    | Vales                                                |
| ------------- | ------- | --------------                                       |
| on-movment    | Hook    | The hook name created on the client wish to invoke   |

#### JavaScript
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
var Hooks = new cwc.Hooks({
});

Hooks.set_hook( {
  hook_name : 'custom-hook-function',
  method    : function( feedback ) { console.log( feedback )  }
});

/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
var ControllerMaster = new cwc.ControllerMaster({
});

window.onload = function() {
    /*------------------------------------------------------
    * @Object AnalogPad
    * Main AnalogPad object
    */
    var AnalogPad = new cwc.AnalogController({
    });
};
{% endhighlight %}

#### HTML
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="pullbar"
    data-cwc-instructions='{ "on-movment" : "custom-hook-function" }' >
    <span></span>
</div>
{% endhighlight %}


#### Movement diagrams
![alt text]( /images/a-pad-cardinal-direction@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-angle-diagram@2x.png "Logo Title Text 1")
![alt text]( /images/a-pad-coordinates-diagram@2x.png "Logo Title Text 1")

**Diagram .01** cardinal_direction, you can spesify a Hook to be called for when the pull bar is pulling by providing an on-pull parameter within the. Mutipal Pullbars can be set in one document.

**Diagram .02**: - You can spesify a Hook to be called for when the pull bar is pulling by providing an on-pull parameter within the. Mutipal Pullbars can be set in one document.

**Diagram .03**: - You can spesify a Hook to be called for when the pull bar is pulling by providing an on-pull parameter within the. Mutipal Pullbars can be set in one document.

| Return data (key)    | value                                                          |
| -------------------- | -------------------------------------------------------------- |
| cardinal_direction   | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| direction            | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| in_out               | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| coordinate           | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| delta                | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| angle                | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —