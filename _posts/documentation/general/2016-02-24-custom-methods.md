---
layout       : feature-doc
title        : "Custom methods"
date         : 2016-02-24 00:31:02 +0000
date_updated : 2016-01-24 00:31:02 +0000
categories   : general
---
## Introduction

The navigation structure allows your to set defined areas within your application that can be controlled via the controller. This is achieved is by adding a `data-cwc-navgroup='*'` data attribute to your HTML markup allowing the **cwc** object to register the group. The `*` should represented the index of the navigation group starting from zero.

## Undestanding the Javascript

{% highlight javascript linenos %}
var custom_method = new cwc.CustomMethod({ });
    custom_method.create_method( {
        name   : 'custom_m_test',
        method : function( prams ) {
            /* -- Your logic here -- */
        }
    });
{% endhighlight %}
