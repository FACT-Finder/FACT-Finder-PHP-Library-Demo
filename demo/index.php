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

// Set up dependency-injection container (Pimple)
// See https://github.com/fabpot/Pimple for more details

$dic = FF::getInstance('Util\Pimple');

// The following logger class will be used everywhere within the library.
// If required, a second logger class can be created to handle logging outside
// of the library differently. Alternatively, you can just instantiate this
// logger with a different scope and configure that scope separately in
// userdata/log4php.xml.

$logClass = FF::getClassName('Util\Log4PhpLogger');
$logClass::configure(USERDATA_DIR.DS.'log4php.xml');

$dic['loggerClass'] = $logClass;

$dic['configuration'] = $dic->share(function($c) {
    return FF::getInstance(
        'Core\XmlConfiguration',
        USERDATA_DIR.DS.'config.xml',
        'production'
    );
});

$dic['encodingConverter'] = $dic->share(function($c) {
    if (extension_loaded('iconv'))
        $type = 'Core\IConvEncodingConverter';
    else if (function_exists('utf8_encode')
             && function_exists('utf8_decode'))
        $type = 'Core\Utf8EncodingConverter';
    else
        throw new \Exception('No encoding conversion available.');

    return FF::getInstance(
        $type,
        $c['loggerClass'],
        $c['configuration']
    );
});

$dic['requestParser'] = $dic->share(function($c) {
    return FF::getInstance(
        'Core\Client\RequestParser',
        $c['loggerClass'],
        $c['configuration'],
        $c['encodingConverter']
    );
});

$dic['clientUrlBuilder'] = function($c) {
    return FF::getInstance(
        'Core\Client\UrlBuilder',
        $c['loggerClass'],
        $c['configuration'],
        $c['requestParser'],
        $c['encodingConverter']
    );
};

$dic['requestFactory'] = $dic->share(function($c) {
    return FF::getInstance(
        'Core\Server\MultiCurlRequestFactory',
        $c['loggerClass'],
        $c['configuration'],
        FF::getInstance('Util\Curl'), // Can be replaced with a stub
        $c['requestParser']->getRequestParameters()
    );
});

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
