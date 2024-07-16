<?php

$modified = filemtime ($_SERVER['SCRIPT_FILENAME']);

// Send a not-modified header when appropriate
if (isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
    if ($modified==strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
        // The browser already has the latest version of the resource
        header ('HTTP/1.1 304 Not Modified');
        exit;
    }
}

// Send cache-related headers
header ('Cache-Control: no-cache');
header ('Last-Modified: '.gmdate('D, d M Y H:i:s T',$modified));

