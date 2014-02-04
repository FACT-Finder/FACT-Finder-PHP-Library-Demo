<?php
namespace FACTFinderDemo;

error_reporting(0);

define('DS', DIRECTORY_SEPARATOR);

define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');

require_once LIB_DIR.DS.'FACTFinder'.DS.'Loader.php';

use FACTFinder\Loader as FF;

require_once USERDATA_DIR.DS.'initialization.php';

$trackingAdapter = FF::getInstance(
    'Adapter\ScicTracking',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestFactory']->getRequest(),
    $dic['clientUrlBuilder']
);

echo $trackingAdapter->doTrackingFromRequest();
