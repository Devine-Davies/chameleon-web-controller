---
layout: feature-doc
title:  "Directional pad"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

this_obj     : "`cwc.DPadController({})`"

f_image      : "/images/d-pad@2x.png"
categories   : components
tax          : controller
---
A 1-way or 5-way {{ page.title }} is perfect for games movement, user interfaces or if you want to have 4 buttons on a controller.
<!--more-->
<!--
![alt text]( {{ page.f_image }} "{{ page.title }}")

### HTML markup
A basic {{ page.title }} can be created with minimal markup by adding the attribute `data-cwc-controller="d-pad"` to the HTML elements you wish to make {{ page.title }}. This will also need to be followed by a set of `data-cwc-btn` in order to create a set of button for the {{ page.title }}

Add a the cwc style to your {{ page.title }} with the `.cwc-style` class.

{% highlight html linenos %}
<section class="dpad cwc-style" data-cwc-controller="dpad" >
    <span data-cwc-btn="up" ></span>
    <span data-cwc-btn="right" ></span>
    <span data-cwc-btn="down" ></span>
    <span data-cwc-btn="left" ></span>
    <span data-cwc-btn="enter" ></span>
</section>
{% endhighlight %}

### JavaScript declaration
To create a new instance of {{ page.title }} The file `_DpadController.js` must be included in the ***cwc* main JS file to use this plugin, along with `_ControllerMaster.js`.

{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
ControllerMaster = new cwc.ControllerMaster({
})

window.onload = function() {
    /*------------------------------------------------------
    * @object - CWC Main DPadController Object
    * @info   - initiate CWC DPadController Object
    */
    DPad = new cwc.DPadController({
    });
};
{% endhighlight %}


[comment]: <> (--------------------------------------------------------------------------------------------------------)

## {{ page.title }} Instructions
Additional settings can be added to each {{ page.title }} through the use of the `data-cwc-instructions` data attribute.

| Properties    | Type    | Description                                                |
| ------------- | ------- | --------------                                             |
| on-tap        | Hook    | Requires custom hook to be call when the button is invoked |

{% highlight html linenos %}
data-cwc-instructions='{ "on-tap" : "on-move-navigation"  }'
<div data-cwc-controller="d-pad"
  data-cwc-instructions='{ "on-move" : "hook:custom-hook"  }' >
</div>
{% endhighlight %}

>When the hook is invoked by the `on-tap` instruction the feedback information is passed back into that hooks method can be found here [controller-feedback-data]({% post_url 2016-02-24-ControllerFeedbackData %}).

## Setting up to work with Navgroup
The following code snippet shows how to connect the  {{ page.title }} up with the [Navgroups]({% post_url 2016-02-24-Navgroup %}) component though the use of adding the `d-hook:cwc:navgroup-action` hook to the on-tap instruction.

#### Display Javascript markup
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
Hooks = new cwc.Hooks({
});

window.onload = function() {
  /*------------------------------------------------------
  * @object - CWC Main Navgroup Object
  * @info   - initiate CWC Navgroup Object
  */
  Navgroup = new cwc.Navgroup({ });
};
{% endhighlight %}

#### Controller HTML markup
{% highlight html linenos %}
<section class="dpad cwc-style" data-cwc-controller="dpad"
    data-cwc-instructions='{ "on-tap" : "d-hook:cwc:navgroup-action"  }' >
    <span data-cwc-btn="up" ></span>
    <span data-cwc-btn="right" ></span>
    <span data-cwc-btn="down" ></span>
    <span data-cwc-btn="left" ></span>
    <span data-cwc-btn="enter" ></span>
</section>
{% endhighlight %}

#### Controller Javascript markup
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
Hooks = new cwc.Hooks({
});

/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
ControllerMaster = new cwc.ControllerMaster({
});

window.onload = function() {
    /*------------------------------------------------------
    * @Object AnalogPad
    * Main AnalogPad object
    */
    AnalogPad = new cwc.DPadController({
    });
};
{% endhighlight %}
 -->