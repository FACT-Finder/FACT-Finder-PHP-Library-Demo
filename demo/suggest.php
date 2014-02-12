<?php
// This script is queried via AJAX when the user starts typing into the search
// box.
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

// We only need on Suggest adapter here.
$suggestAdapter = FF::getInstance(
    'Adapter\Suggest',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['request'],
    $dic['clientUrlBuilder']
);

// Note that we don't need to configure the adapter any further. The `Request`
// object it gets is pre-populated with all parameters passed to this script.
// We rely on the fact that those parameters contain all necessary
// configuration.
//
// If possible we simply pass through the raw data obtained from FACT-Finder
// without any further processing. This is because FACT-Finder generates JSONP
// output which will be processed by the frontend instead of the library.
try {
	echo $suggestAdapter->getRawSuggestions();
} catch (\Exception $e) {
	if (!headers_sent()) {
		// close connection to browser if that is possible
		header("Content-Length: 0");
		header("Connection: close");
		flush();

		/* if you want, you can log errors here. this will not cause the user to wait for the request * /
		// log error
		$logfile = "suggest.error.log";
		$f = fopen($logfile, 'a');
		fwrite($f, date(DATE_RFC822).': error ['.$e->getMessage().'] for search request ['.$dataProvider->getAuthenticationUrl()."]\n");
		fclose($f);
		// */
	}
}
