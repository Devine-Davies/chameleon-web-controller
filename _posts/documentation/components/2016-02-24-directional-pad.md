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
Integrating the powerful Navgroup system into the user interface will allow you to build a quick complex navigation structure to your appliaction, allowing your users move around freely using keyboard events.
<!--more-->

![alt text]( {{ page.f_image }} "{{ page.title }}")

### HTML markup
A basic D-pad can be created with minimal markup, Add the attribute `data-cwc-controller="d-pad"` to your HTML elements followed by `data-cwc-cbtn` set.

Add a the cwc style to your {{ page.title }} with the `.cwc-style` class.

{% highlight html linenos %}
<section class="dpad cwc-style" data-cwc-controller="dpad" >
    <span data-cwc-cbtn="up" ></span>
    <span data-cwc-cbtn="right" ></span>
    <span data-cwc-cbtn="down" ></span>
    <span data-cwc-cbtn="left" ></span>
    <span data-cwc-cbtn="enter" ></span>
</section>
{% endhighlight %}

### JavaScript declaration
In order to register a D-Pad you must call the {{ page.this_obj }} initiator object after the DOM has finshed loading. `cwc.ControllerMaster({})` must be included

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
[comment]: <> (--------------------------------------------------------------------------------------------------------)


## {{ page.title }} Instructions
Additional settings can be added to each {{ page.title }} through the use of the `data-cwc-instructions` data attrabute.

| Properties    | Type    | Vales                  |
| ------------- | ------- | --------------         |
| on-tap        | Hook    | Callback hook function |

{% highlight html linenos %}
data-cwc-instructions='{ "on-tap" : "on-move-navigation"  }'
{% endhighlight %}


— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

| Return data (key)    | value                                                          |
| -------------------- | -------------------------------------------------------------- |
| cardinal_direction   | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| direction            | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| in_out               | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| coordinate           | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| delta                | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|
| angle                | — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —|

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —