---
layout: feature-doc
title:  "Spider navigation "
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

f_image    : "images/spider-nav@2x.png"
categories : feature
tax        : display
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

[//]: # (/*--------------------------)
[//]: # (Page Links)
[//]: # (--------------------------*/)

## Introduction
The navigation structure allows your to set defined areas within your application that can be controlled via the controller. This is achieved is by adding a `data-cwc-navgroup='*'` data attribute to your HTML markup allowing the **cwc** object to register the group. The `*` should represented the index of the navigation group starting from zero.

`data-cwc-navitem` are used to define an item within the navigation group. Adding the value of `starting-point` will allow you to set the main focus on where you wish to start the user when your aplliaction is loaded. Only one 'starting-point' can be set within your appliaction.

>As the navigation structure is optamised to respond to keyboard events, it's good practices to develop and test you navigation with this method.
>Then introduce the controller functionality when you have your UI in-place.

## Binding Actions
After you have defined a **cwc** navgation, you can then bind instructions to that navigation through the use of `data-cwc-nav-key-instructions="{}"` data attribute. Instructions need to be given in JSON format with each one of the keys-value pairs describe below.

| Trigger  (key)  | Description                                    |
| --------------- | ---------------------------------------------- |
| up              | Up event : Keyboard keys (↑ & W)               |
| right           | Right event : Keyboard keys (→ & D)            |
| down            | Down event : Keyboard keys (↓ & S)             |
| left            | left event : Keyboard keys (→ & A)             |
| enter           | Enter event : Keyboard keys (↵)                |

All triggers must be supported by one of the following:

| Action  (value)  | Description                                                             |
| ---------------- | ----------------------------------------------------------------------- |
| ng-next          | Selecting the **next** navigation                                       |
| ng-prev          | Selecting the **previous** navigation                                   |
| ng-(name)        | Replace the `*` with the **name** of the navigation you wish to target  |
| ni-next          | Move to the **next** item inside the given navigation                   |
| ni-prev          | Move to the **previous** item inside the given navigation               |
| hook-*           | hooks allows you to link to predefinded `cwc.CustomMethod()`            |

>Indvidual navigation items can also used these methords in order to override the main instuctiuons given to a navigation group; To achivce this, add a `data-cwc-item-overide="{}"` data attrabite to the item you with to perfrom overides on.

### Example
Here is an example of the typ of HTML markup is required in order to build a navigation object.

{% highlight html linenos %}
<div class="side-nav" data-cwc-navgroup="first-nav" data-cwc-nav-key-instructions='{ "up" : "ni-prev" , "down" : "ni-next", "right" : "ng-next" }' >
  <section data-cwc-navitem >Item One</section>
  <section data-cwc-navitem >Item Two</section>
  <section data-cwc-navitem >Item Three</section>
</div>

<div class="main-window" data-cwc-navgroup="1" data-cwc-onnaventrance="history-item" data-cwc-nav-key-instructions='{ "down" : "ng-2", "right" : "ni-next" , "left" : "ni-prev" }' >
  <ul>
    <li data-cwc-navitem="starting-point"
    data-cwc-item-overide='{ "left" : "ng-first-nav", "enter" : "cm-on-item-enter"  }' >1</li>
    <li data-cwc-navitem data-cwc-item-overide='{ "left" : "ng-first-nav", "enter" : "cm-on-item-enter"  }'  ><span>2</span></li>
    <li data-cwc-navitem ><span>3</span></li>
    <li data-cwc-navitem ><span>4</span></li>
    <li data-cwc-navitem ><span>5</span></li>
    <li data-cwc-navitem ><span>6</span></li>
  </ul>
</div>
{% endhighlight %}

## Initializing with JavaScript

In order to link the navigation groups with the **cwc** objetct, call the `cwc.Navigation()` after the dom has loaded.

{% highlight javascript linenos %}
window.onload = function() {
  var navigation = new cwc.Navigation({
      classes : {
          group : 'custom_class_name',
          item  : 'custom_class_name',
      },

      callbacks : {
          onnav_changed  : function( info ){ console.log( info ) },
          onitem_changed : function( info ){ console.log( info ) }
      }
  });
};
{% endhighlight %}

### Optional Parameters

You can define the class name you wish to use on active navigation groups and items.

| Parameters    | Description                                     |
| ------------- | ----------------------------------------------- |
| group         | Custom class or `cwc-selected-group` by default |
| item          | Custom class or `cwc-selected-item` by default |

Callback methods allow you to spesify a custom method **after** the **cwc** has moved to a new navigation or item.

| Parameters     | Description                                                                          |
| -------------  | ------------------------------------------------------------------------------------ |
| onnav_changed  | Callback method for when a navigation has moved to a new index. `tracking` object returned. |
| onitem_changed | Callback method for when an item has moved to a new index. `tracking` object returned.        |

>The `tracking` object will consist of references to all indexes and elements when switching to a new navigation posistion.

### Additional JavaScript

#### Invoke direction

You can invoke a navigation movement with JS by calling the `invoke_dir` method on the `cwc.Navigation({})` object.
You can then specify a **Trigger** as the first parameter along with an optional callback function as the second parameter.

{% highlight javascript linenos %}
var navigation = new cwc.Navigation({});
navigation.invoke_dir('up', function( tracking ){
    /* -- Logic here -- */
});

navigation.invoke_dir('down', function( tracking ){
    /* -- Logic here -- */
});

navigation.invoke_dir('enter', function( tracking ){
    /* -- Logic here -- */
});
{% endhighlight %}