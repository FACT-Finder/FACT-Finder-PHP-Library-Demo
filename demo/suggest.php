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

$suggestAdapter = FF::getInstance(
    'Adapter\Suggest',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['requestFactory']->getRequest(),
    $dic['clientUrlBuilder']
);

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
