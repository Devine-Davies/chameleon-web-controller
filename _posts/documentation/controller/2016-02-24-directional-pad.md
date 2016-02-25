---
layout: feature-doc
title:  "Directional pad"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000
categories: controller
---
## Introduction
The navigation structure allows your to set defined areas within your application that can be controlled via the controller. This is achieved is by adding a `data-cwc-navgroup='*'` data attribute to your HTML markup allowing the **cwc** object to register the group. The `*` should represented the index of the navigation group starting from zero.

`data-cwc-navitem` are used to define an item within the navigation group. Adding the value of `starting-point` will allow you to set the main focus on where you wish to start the user when your aplliaction is loaded. Only one 'starting-point' can be set within your appliaction.


{% highlight html linenos %}
  <section class="cwcd-pad-style" data-cwc-controller="d-pad"  >
      <span data-cwc-cbtn="up" ></span>
      <span data-cwc-cbtn="right" ></span>
      <span data-cwc-cbtn="down" ></span>
      <span data-cwc-cbtn="left" ></span>
      <span data-cwc-cbtn="enter" ></span>
  </section>
{% endhighlight %}







{% highlight javascript linenos %}
window.onload = function() {
  var SwipePad = new cwc.SwipePad({
      /* -- Options -- */
  });
};
{% endhighlight %}