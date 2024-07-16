<?php require '../private/cache-control.php'; require '../private/headers.php'; ?>

<menu>
  <li><a data-handlers="doubleclick{about}" href="#view/home">Home</a></li>
  <li><a href="#test/eg1/eg2">Test</a></li>
  <li><a href="./other.html">Other page</a></li>
</menu>
<h4 class="readme">If the frameworks sees handlers with a framework href, Event.preventDefault() is used and the browser URL and state is changed</h4>

