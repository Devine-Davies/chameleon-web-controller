---
layout: feature-doc
title:  "Navigation"
date:   2016-02-24 00:31:01 +0000
date_updated : 2016-01-24 00:31:02 +0000
categories: display
---

## Introduction
To add new posts, simply add a file in the `_posts` directory that follows the convention `YYYY-MM-DD-name-of-post.ext` and includes the necessary front matter. Take a look at the source for this post to get an idea about how it works.

## Data Actions
To add new posts, simply add a file in the `_posts` directory that follows the convention `YYYY-MM-DD-name-of-post.ext` and includes the necessary front matter. Take a look at the source for this post to get an idea about how it works.

| Actions       | Description   |
| ------------- |-------------  |
| ni-next       | next nav item |
| ni-prev       | previous nav item |
| ng-next       | next nav group |
| ng-prev       | previous nav group |
| ng-*          | index number of the group you wish to navigation too |
| cm-*          | add custom methord to end of arg, must be set up in custom methords |

### Ataching Events
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

| Events        | Description                                       |
| ------------- | ------------------------------------------------- |
| up            | pass one of the following n* items as an argument |
| right         | pass one of the following n* items as an argument |
| down          | pass one of the following n* items as an argument |
| left          | pass one of the following n* items as an argument |
| enter         | pass one of the following n* items as an argument |

>Lorem Ipsum is  Inline `{ "down" : "ng-2", "right" : "ni-next" }` has printing and typesetting industry. Lorem Ipsum  `{ "enter" : "cm-my-custom-methord"  } ` it. simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's

## HTML Markup
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s

{% highlight html linenos %}
<div class="side-nav" data-cwc-navgroup="0" data-cwc-nav-key-instructions='{ "up" : "ni-prev" , "down" : "ni-next", "right" : "ng-next" }' >
      <section data-cwc-navitem >Item One</section>
      <section data-cwc-navitem >Item Two</section>
      <section data-cwc-navitem >Item Three</section>
</div>

<div class="main-window" data-cwc-navgroup="1" data-cwc-onnaventrance="history-item"
  data-cwc-nav-key-instructions='{ "down" : "ng-2", "right" : "ni-next" , "left" : "ni-prev" }' >
    <ul>
      <li data-cwc-navitem="starting-point" data-cwc-item-overide='{ "left" : "ng-0", "enter" : "cm-on-item-enter"  }' ><span>1</span></li>
      <li data-cwc-navitem data-cwc-item-overide='{ "left" : "ng-0", "enter" : "cm-on-item-enter"  }'  ><span>2</span></li>
      <li data-cwc-navitem ><span>3</span></li>
      <li data-cwc-navitem ><span>4</span></li>
      <li data-cwc-navitem ><span>5</span></li>
      <li data-cwc-navitem ><span>6</span></li>
    </ul>
</div>
{% endhighlight %}

## Initializing with JavaScript
You’ll find this post in your `_posts` directory. Go ahead and edit it and re-build the site to see your changes. You can rebuild the site in many different ways, but the most common way is to run `jekyll serve`, which launches a web server and auto-regenerates your site when a file is updated.

{% highlight javascript linenos %}
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
{% endhighlight %}

Go ahead and edit it and re-build the site to see your changes. You can

{% highlight javascript linenos %}
navigation.on('onnav_changed', function(){
    /* -- Logic here -- */
})

navigation.on('onitem_changed', callback())
function callback(){
  /* -- Logic here -- */
}

{% endhighlight %}