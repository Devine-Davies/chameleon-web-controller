---
layout: feature-doc
title:  "Analog controller"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

this_obj     : "`cwc.AnalogController({})`"

f_image      : "/images/a-pad@2x.png"
categories   : components
tax          : controller
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
<!--more-->

![alt text]( ../images/a-pad-2@2x.png "Logo Title Text 1")
![alt text]( ../images/a-pad@2x.png "Logo Title Text 1")

### Simple html sample
Elements with an `data-cwc-controller="analog"` attribute applied to them will be treated as an {{ page.title }} by the **cwc** object. The child span tag is required in order to be used as the {{ page.title }} stick. To add the **cwc** style to your {{ page.title }} toy will need to include the class name of `.cwc-style`.

{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"  >
  <span></span>
</div>
{% endhighlight %}

### JavaScript Declaration
To create a new instance of {{ page.title }} The file `_AnalogController.js` must be included in the ***cwc* main JS file to use this plugin, along with `_ControllerMaster.js`.

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
Additional settings can be added to each {{ page.title }} through the use of the `data-cwc-instructions` data attribute.

| Instructions  | Types   | Descriptions                                                   |
| ------------- | ------- | --------------                                                 |
| movement-type | String  | How you want your users to interact with the {{ page.title }}. |
| on-move       | Hook    | Requires custom hook to be call when the action occurs.        |
| panstart      | Hook    | Requires custom hook to be call when the action occurs.        |
| panend        | Hook    | Requires custom hook to be call when the action occurs.        |



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Movement type
You can change the way the user interacts with the {{ page.title }} by setting the `movement-type` property within the data instructions attribute.

| Instruction   | Type    | Values            |
| ------------- | ------- | --------------    |
| movement-type | String  | `pan` or `tick`   |

- **Pan**: Recognised when the pointer is down and moved in the allowed direction.

- **Tick**: Will continuously invoke the hook function when when pointer is down, regardless if movment is happening or not.

#### Setting moment type snippet
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "movement-type" : "tick" }' >
  <span></span>
</div>
{% endhighlight %}


[comment]: <> (--------------------------------------------------------------------------------------------------------)

## On move
The On move events is invoked depending on which type of movement setting has been applied to the {{ page.title }}

| Instruction   | Type    | Argument             |
| ------------- | ------- | --------------       |
| on-move       | Hook    | `d-hook:cwc:navgroup-action`, `d-hook:`, `hook:` |

The `on-move` instruction can also be set up to work along side the [Navgroups]{{ site.baseurl }}({% post_url 2016-02-24-Navgroup %}) component. Adding `d-hook:cwc:navgroup-action` as an argument for this instruction will initiate this relationship.

#### Setting on-move snippet
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "on-move" : "hook:on-move-hook“ }' >
  <span></span>
</div>

<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "on-move" : "d-hook:cwc:navgroup-action“ }' >
  <span></span>
</div>
{% endhighlight %}

>The on `on-move` instruction will be feedback information about the type of movement that has occurred. Information about the type of feedback information provided can be found [Controller Returned InputData]{{ site.baseurl }}({% post_url 2016-02-24-ControllerReturnedInputData %}).



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Panstart
The Panstart events is invoked as soon as the user starts to interact with the component. This events is fired regardless of it's movement type.

| Instruction   | Type    | Argument             |
| ------------- | ------- | --------------       |
| panstart      | Hook    | Requires custom hook |

#### Setting panstart snippit
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "panstart" : "d-hook:pan-started“ }' >
  <span></span>
</div>
{% endhighlight %}

>The on `panstart` instruction will be feedback information about the type of movement that has occurred. Information about the type of feedback information provided can be found [Controller Returned InputData]{{ site.baseurl }}({% post_url 2016-02-24-ControllerReturnedInputData %}).




[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Panend
The Panend events is invoked as soon as the user has finished interacting with the {{ page.title }}. This events is fired regardless of it's movement type.

| Instruction   | Type    | Argument             |
| ------------- | ------- | --------------       |
| panend        | Hook    | Requires custom hook |

#### Setting panstart snippit
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "panstart" : "hook:pan-ended }' >
  <span></span>
</div>
{% endhighlight %}

>The on `panstart` instruction will be feedback information about the type of movement that has occurred. Information about the type of feedback information provided can be found [Controller Returned InputData]{{ site.baseurl }}({% post_url 2016-02-24-ControllerReturnedInputData %}).



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Code snippets
Below are some code snippets you may find useful to used within your application.

### Call custom hook on display
The following code snippet shows a how to use the {{ page.title }} to call a custom hook set on the display application when moving. The panstart and panend hooks are called on the controller application.

#### Display clinet JavaScript
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
var Hooks = new cwc.Hooks({
});

Hooks.set_hook( {
  hook_name : 'analog-move-hook',
  method    : function( feedback ) { console.log( feedback )  }
});
{% endhighlight %}

#### Controller client HTML
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="analog"
  data-cwc-instructions='{ "movement-type" : "tick", "on-move" : “d-hook:analog-move-hook“, "pan-start" : "hook:start-hook“, "pan-end" : "hook:on-end  }'  >
  <span></span>
</div>
{% endhighlight %}

#### Controller client JavaScript
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
var Hooks = new cwc.Hooks({
});

Hooks.set_hook( {
  hook_name : 'start-hook',
  method    : function( feedback ) { console.log( feedback )  }
});

Hooks.set_hook( {
  hook_name : 'end-hook',
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