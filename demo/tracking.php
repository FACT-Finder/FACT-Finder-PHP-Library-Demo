<?php
namespace FACTFinderDemo;

error_reporting(0);

define('DS', DIRECTORY_SEPARATOR);

define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');

require_once LIB_DIR.DS.'FACTFinder'.DS.'Loader.php';

use FACTFinder\Loader as FF;

// Set up dependency-injection container (Pimple)
// See https://github.com/fabpot/Pimple for more details

$dic = FF::getInstance('Util\Pimple');

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

$trackingAdapter = FF::getInstance(
    'Adapter\ScicTracking',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestFactory']->getRequest(),
    $dic['clientUrlBuilder']
);

echo $trackingAdapter->doTrackingFromRequest();
