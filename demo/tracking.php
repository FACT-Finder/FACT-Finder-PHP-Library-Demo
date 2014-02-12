<?php
// This script is queried via AJAX when various events on the page are supposed
// to be tracked.
//
// The initial setup code is identical to that in [index.php](index.html).
namespace FACTFinderDemo;

error_reporting(0);

define('DS', DIRECTORY_SEPARATOR);

define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');

require_once LIB_DIR.DS.'FACTFinder'.DS.'Loader.php';

use FACTFinder\Loader as FF;

$dic = FF::getInstance('Util\Pimple');

// Load the [initialization script](initialization.html). This is common to all
// entry-point scripts. We extract this into a separate
// script in `./userdata`, because it is basically a programmatic configuration
// of the library.
require_once USERDATA_DIR.DS.'initialization.php';

// We only need one Tracking adapter here.
$trackingAdapter = FF::getInstance(
    'Adapter\ScicTracking',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['request'],
    $dic['clientUrlBuilder']
);

// The requests to this script are prepared in such a way that all necessary
// tracking parameters are passed in. These are used to populate the `Request`
// object we pass to `$trackingAdapter`, and hence we don't need any further
// manual configuration.
echo $trackingAdapter->doTrackingFromRequest();
