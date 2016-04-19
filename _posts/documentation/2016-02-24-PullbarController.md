---
layout: feature-doc
title:  "Pullbars"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000

this_obj     : "`PullbarController({})`"

f_image    : "/images/p-par@2x.png"
categories : components
tax        : controller
---
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
<!--more-->

![alt text]( ../images/p-par@2x.png "Logo Title Text 1")

### HTML markup
Elements with an attribute of `data-cwc-controller="pullbar"` applied to them will be treated as a {{ page.title }} component by the **cwc** object.

Add a the cwc style to your {{ page.title }} with the `.cwc-style` class.

{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="pullbar"  >
    <span></span>
</div>
{% endhighlight %}

### JavaScript Declaration
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
    * @object - CWC Main PullbarController Object
    * @info   - initiate CWC PullbarController Object
    */
    var PullbarController = new cwc.PullbarController({
    });
};
{% endhighlight %}



[comment]: <> (--------------------------------------------------------------------------------------------------------)

## {{ page.title }} instructions
Additional settings can be added to each Pullbar controller through the use of the `data-cwc-instructions` data attribute. Here is a list of all the instructions associated with the Pullbar component.

| instructions  | Type    | Vales                                                   |
| ------------- | ------- | --------------                                          |
| direction     | String  | Horizontal or Vertical.                                 |
| on-pull       | Hook    | The hook name you wish to invoke whel Pullbar is pulled |

{% highlight html linenos %}
data-cwc-instructions='{ "direction" : "vertical", "on-pull " : "hook:cunstom-hook" }'
{% endhighlight %}


[comment]: <> (--------------------------------------------------------------------------------------------------------)

## On pull hook
The on pull methord is fired when the user is interacting with a Pullbar.

| instructions  | Type    | Vales                                                |
| ------------- | ------- | --------------                                       |
| on-pull       | Hook    | `d-hook:cwc:scroll-viewport`, `d-hook:`, `hook:`     |

#### HTML
{% highlight html linenos %}
<div class="cwc-style" data-cwc-controller="pullbar"
    data-cwc-instructions='{ "on-pull" : “hook:custom-hook" }' >
    <span></span>
</div>
{% endhighlight %}

#### JavaScript
{% highlight javascript linenos %}
/*------------------------------------------------------
* @object - CWC Main Hooks Object
* @info   - initiate CWC Hooks Object
*/
var Hooks = new cwc.Hooks({
});

Hooks.set_hook( {
  hook_name : 'custom-hook',
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
    * @object - CWC Main PullbarController Object
    * @info   - initiate CWC PullbarController Object
    */
    var PullbarController = new cwc.PullbarController({
    });
};
{% endhighlight %}

>When the hook is invoked by the `on-pull` method of the {{ page.title }} feedback information is passed back into that hooks method. Feedback information can be found here [Controller Returned InputData]{{ site.baseurl }}({% post_url 2016-02-24-ControllerReturnedInputData %}).