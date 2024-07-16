<?php require '../private/cache-control.php'; require '../private/headers.php'; ?>

<section data-box>
  This is a box in the home view.
</section>

<section data-layer="2" data-box>
  This box is layer 2 in the home view.
</section>

<button data-handlers="click{about} doubleclick{about}">Run Methods.about()</button>

<a href="#" data-handlers="click {test (x,y,z)}">Test by data-handlers</a>

<a href="#test/x/y/z">Test by href</a>





<pre class="readme">
data-handlers


Use whitespace between anything, nothing or somewhere between.
  data-handlers=" click [ about ] doubleclick [ about ( val1, val2, val3 ) ] "
  data-handlers="click[about]doubleclick[about(some,value,args)])"

Have asynchronous calls to multiple methods.
  data-handlers="mouseover[func1] mouseover[func2] mouseover[func3]"

Pass primitive arguments to methods.
No escape capability for comma, round/square bracket or leading/trailing space.
  data-handlers="mouseover[] func1(         37    red balloons      ,wednesday morning  )"
Inner white space is preserved so the above produces args to the method:
  [ '37    red balloons', 'wednesday morning' ]
</pre>





<pre class="readme">
JS has these Framework.write options available:
{
    contenttype : 'text/html', // the only alternative is text/plain - TODO SVG is just HTML; that's it?
    destination : myOtherTarget,
    output : '<section>Some HTML</section>',
    statechange : 'none', // [ none replace push ]
    statehash : '' // for statechange='push',
    force : [
        'destination'
    ]
}
These are the Framework.write options available as data-attributes:
 * data-destination indicates the output destination container element
    - data-destination="selector{'[my-data-attribute] > selector'}" - find the element in the DOM
    - data-destination="id{'my-element-uid}" - find the element by ID or create and append it to this element
    - data-destination="1," - indicates the element where innerHTML should be written
 * data-layer selects the application layer for the box: [data-layer]{}
    - data-layer hones the CSS selector for the application layer [data-layer]{} and [data-layer="1"]{}
data-persistence="sticky"

Precedence
 * 


Level number should be greater than 0 (reserved for app0) and less than 1000 (reserved for appLogin)
Many layers may share the same level
Conventionally, bespoke CSS for class n by modifying the selector [data-layer="1"]


Persistence options:
    notify  - destroy after Config.app.notifyTimeout seconds
    splash  - destroy on the next user interaction
    rewrite - destroy when the JS closest() layer experiences a rewrite
    view    - destroy a rewrite occurs *and* the state method/view is changed (top level navigation)
    sticky  - do not destroy (the default)
Notifications disappear by themselves and splash messages are simply clicked away.
How users get to close more persistent layers is down to your application.



</pre>

