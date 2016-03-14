---
layout: feature-doc
title:  "Directional pad"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000
categories: controller
---
## Introduction

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

## Building the D-pad

A basic D-pad can be created with minimal markup, Add the attribute `data-cwc-controller="d-pad"` to your HTML elements followed by `data-cwc-cbtn="up"` to represent a trigger button.

Out of the box, the D-pad is designed to work simultaneously with the navigation interface [link] when installed on the display.

{% highlight html linenos %}
<section class="dpad cwc-style" data-cwc-controller="dpad" data-cwc-instructions='{ "on-tap" : "on-move-navigation"  }'  >
    <span data-cwc-cbtn="up" ></span>
    <span data-cwc-cbtn="right" ></span>
    <span data-cwc-cbtn="down" ></span>
    <span data-cwc-cbtn="left" ></span>
    <span data-cwc-cbtn="enter" ></span>
</section>
{% endhighlight %}

| cwc-instructions     | value                                                          |
| -------------------- | -------------------------------------------------------------- |
| movement-type        | pan or touch                                                   |
| on-touch             | Add callback function that has been declared in custom mthords |

>— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

## Styling
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

## Undestanding the Javascript

In order to register a D-Pad you must call the D-pad initiator object within the **cwc** framework. As the D-pad is designed to work with the navigation interface this will try to work alongside that, unless given call back methods for each of the button.

{% highlight javascript linenos %}
window.onload = function() {
    /*------------------------------------------------------
    * @Object Controller master
    * Main Controller object
    */
    var ControllerMaster = new cwc.ControllerMaster({
    });

    /*------------------------------------------------------
    * @Object DPadController
    * Main DPadController object
    */
    var DPad = new cwc.DPadController({
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