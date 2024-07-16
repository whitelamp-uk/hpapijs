<?php require '../private/cache-control.php'; require '../private/headers.php'; ?>

<section>

  <form method="post" target="autocomplete" action="about:blank">

    <!--
    Modern browsers ignore autocomplete="on" in a login form
    https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion
    Google Chrome criticises for missing autocomplete attribute
    -->
    <p>Email <input data-email type="email" name="email" autocomplete="on" /></p>

    <p>Password <input data-password type="password" name="password" /></p>

    <button data-handlers="click { login (submit) }">Submit</button>
    <button data-handlers="click { login (cancel) }">Cancel</button>

  </form>

</section>

