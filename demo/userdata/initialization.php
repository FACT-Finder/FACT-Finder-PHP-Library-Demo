<?php
namespace FACTFinderDemo;

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
        $c['requestParser']->getRequestParameters()
    );
});
