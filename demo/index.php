<?php
namespace FACTFinderDemo;

// configure application
error_reporting(E_ALL );

define('DS', DIRECTORY_SEPARATOR);

define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('TEMPLATE_DIR', DEMO_DIR.DS.'templates');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');
define('HELPER_DIR', DEMO_DIR.DS.'helper');

// init
require_once LIB_DIR.DS.'FACTFinder'.DS.'Loader.php';
require_once HELPER_DIR.DS.'HtmlGenerator.php';

use FACTFinder\Loader as FF;

require_once USERDATA_DIR.DS.'initialization.php';

$searchAdapter = FF::getInstance(
    'Adapter\Search',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestFactory']->getRequest(),
    $dic['clientUrlBuilder']
);

$tagCloudAdapter = FF::getInstance(
    'Adapter\TagCloud',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestFactory']->getRequest(),
    $dic['clientUrlBuilder']
);

// Run / Render View
$htmlGenerator = new Helper\HtmlGenerator(
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestParser'],
    $searchAdapter,
    $tagCloudAdapter,
    TEMPLATE_DIR
);

$output = $htmlGenerator->getHtmlCode();
echo $output;
