---
layout: feature-doc
title:  "Gesture Pad"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

this_obj     : "`GesturePadController({})`"

f_image     : "/images/swipe-pad@2x.png"
categories  : components
tax         : controller
---
4 or 8 way directional touch or swipe pad, perfect if you need more dynamic movement around around your application.
<!--more-->

![alt text]( {{ page.f_image }} "{{ page.title }}")

### HTML markup
Elements with an attribute of `data-cwc-controller=“gesture-pad"` applied to them will be treated as a {{ page.title }} component by the **cwc** object.

Add a the **cwc** style to your {{ page.title }} with the `.cwc-style` class.

{% highlight html linenos %}
<section class="cwc-style"  data-cwc-controller="gesture-pad" >
  <span></span>
</section>
{% endhighlight %}

### JavaScript Declaration
`cwc.ControllerMaster({})` must be included and the {{ page.this_obj }} has to be initiated after the DOM has finished loading.

{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
ControllerMaster = new cwc.ControllerMaster({
})

window.onload = function() {
    /*------------------------------------------------------I
    * @Object GesturePadController
    * Main GesturePadController object
    */
    GesturePad = new cwc.GesturePadController({
    });
};
{% endhighlight %}



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## {{ page.title }} Instructions
Additional settings can be added to each {{ page.title }} through the use of the `data-cwc-instructions` data attribute to support more sophisticated features.

| Instructions  | Types   | Descriptions                                                   |
| ------------- | ------- | --------------                                                 |
| movement-type | Sting   | How you want your users to intract with the {{ page.title }}.  |
| on-movement   | Hook    | Prvideo the name of the hook you wish to run when moving.      |

{% highlight html linenos %}
<div data-cwc-controller="gesture-pad" data-cwc-instructions='{ "movement-type" : "pan", "on-movement " : "hook-cunstom-hook" }' ></div>
{% endhighlight %}



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Movement type
You can change the way the user interacts with the {{ page.title }} by setting the `movement-type` property within the data instructions attribute.

| Instruction   | Type    | Value             |
| ------------- | ------- | --------------    |
| movement-type | Sting   | `pan` or `touch`  |

#### **Pan**
Recognised when the pointer is down and moved in the allowed direction.

#### **Swipe**
Recognised when the pointer is down and moved has finded.

#### HTML
{% highlight html linenos %}
<div data-cwc-controller="gesture-pad"
     data-cwc-instructions='{"movement-type" : "pan"}' >
     <span></span>
</div>

<div data-cwc-controller="gesture-pad"
     data-cwc-instructions='{"movement-type" : "swipe"}' >
     <span></span>
</div>
{% endhighlight %}



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## On move
You can spesify a callback function to be called for when the component is moving. By providing a Hook for the on `on-move` parameter.

| Instruction | Type    | Value                                            |
| ----------- | ------- | --------------                                   |
| on-move     | Hook    | `d-hook:cwc:navgroup-action`, `d-hook:`, `hook:` |

#### HTML
{% highlight html linenos %}
<section data-cwc-controller="gesture-pad"
  data-cwc-instructions='{ "movement-type" : "swipe", "on-move" : "d-hook:cwc:navgroup-action"  }' >
  <span></span>
</section>

<section data-cwc-controller="gesture-pad"
  data-cwc-instructions='{ "movement-type" : "swipe", "on-move" : "d-hook:custom-hook"  }' >
  <span></span>
</section>
{% endhighlight %}

>When the hook is invoked by the `on-move` method of the {{ page.title }} feedback information is passed back into that hooks method. Feedback information can be found here [controller-feedback-data]({% post_url 2016-02-24-ControllerFeedbackData %})



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## Usfell snippets
Below are some code snippets you may find useful to used within your application.

### Creating a Gesture Pad
The following code snippet shows a how to use the {{ page.title }} with the Navgroup component.

#### JavaScript
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
Hooks = new cwc.Hooks({
});

Hooks.set_hook( {
  hook_name : 'custom-hook',
  method    : function( feedback ) { console.log( feedback )  }
});

/*------------------------------------------------------
* @object - CWC Main ControllerMaster Object
* @info   - initiate CWC ControllerMaster Object
*/
ControllerMaster = new cwc.ControllerMaster({
});

window.onload = function() {
    /*------------------------------------------------------
    * @Object GesturePadController
    * Main GesturePadController object
    */
    GesturePad = new cwc.GesturePadController({
    });
};
{% endhighlight %}

#### HTML
{% highlight html linenos %}
<section class="gesture-pad-01 cwc-style"  data-cwc-controller="gesture-pad"
  data-cwc-instructions='{ "movement-type" : "pan", "on-move" : "hook:custom-hook"  }' >
  <span></span>
</section>

<section class="gesture-pad-02 cwc-style"  data-cwc-controller="gesture-pad"
  data-cwc-instructions='{ "movement-type" : "pan", "on-move" : "d-hook:custom-hook"  }' >
  <span></span>
</section>
{% endhighlight %}