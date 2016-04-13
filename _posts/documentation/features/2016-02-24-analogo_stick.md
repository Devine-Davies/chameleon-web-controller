---
layout: feature-doc
title:  "Analog Stick"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

f_image      : "images/a-pad@2x.png"
categories: feature
tax : controller, diaplay
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

## Introduction
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

## HTML Markup
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

{% highlight html linenos %}
<section class="touchpad cwc-style"  data-cwc-controller="touchpad" data-cwc-instructions='{ "movement-type" : "pan", "on-touch" : "on-move-navigation"  }' >
      <span></span>
</section>
{% endhighlight %}

| cwc-instructions     | value                                                          |
| -------------------- | -------------------------------------------------------------- |
| movement-type        | pan or touch                                                   |
| on-touch             | Add callback function that has been declared in custom mthords |

## Undestanding the Javascript
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

{% highlight javascript linenos %}
window.onload = function() {
    /*------------------------------------------------------
    * @Object Controller master
    * Main Controller object
    */
    var ControllerMaster = new cwc.ControllerMaster({
    });

    /*------------------------------------------------------
    * @Object AnalogPad
    * Main AnalogPad object
    */
    var AnalogPad = new cwc.AnalogController({
    });
};
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