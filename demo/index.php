<?php
// This is the annotated source code of the [FACT-Finder PHP Library Demo](https://github.com/FACT-Finder/FACT-Finder-PHP-Library-Demo), a minimal example that showcases
// how to use the most recent version of the [FACT-Finder PHP Library](https://github.com/FACT-Finder/FACT-Finder-PHP-Library).
//
// **Note:** The entire library resides in the `\FACTFinder` namespace, which is
// why that namespace will be omitted in all "fully" qualified class names in
// this documentation.
//
// There are three different entry-point scripts. *index.php* (the one you are
// looking at, which handles displaying all pages to the user), [*suggest.php*](suggest.html)
// and [*tracking.php*](tracking.html) which are called by AJAX requests.
//
// **Here we go!**

// ## Setting up the environment
namespace FACTFinderDemo;

error_reporting(E_ALL);

// Set up constant with a few useful directory names.
define('DS', DIRECTORY_SEPARATOR);
define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('TEMPLATE_DIR', DEMO_DIR.DS.'templates');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');
define('HELPER_DIR', DEMO_DIR.DS.'helper');

// ## Setting up the library

// As far as the library is concerned we only need to `require` the
// `Loader` class. This will take care of loading all necessary
// library files on demand. It mainly provides two static methods, which take a
// fully qualified class name *minus the root namespace* `FACTFinder\`:
//
// - `getInstance()` resolves that name, loads the necessary source file
//   and instantiates the class for you. Constructor arguments can be passed in
//   after the class name.
// - `getClassName()` also loads the file, but only gives you a string with the
//   fully qualified class name. Use this to call static methods.
require_once LIB_DIR.DS.'FACTFinder'.DS.'Loader.php';

// We'll be using the `Loader` class a lot, so we define a short alias.
use FACTFinder\Loader as FF;

// To wire up all the necessary library objects, we are using the dependency
// injection container (DIC) [Pimple](https://github.com/fabpot/Pimple).
// Basically, for each dependency we create an anonymous function that describes
// how the dependency is created. We can either just store this in the DIC - in
// which case it will be called every time needs an instance of the dependency -
// or we can first pass our anonymous funcion to `$dic->share()`, which
// basically makes the dependency a Singleton. Please refer to Pimple's
// documentation for more information on its usage.

// Note that we provide Pimple as part of the library, such that we can load it
// via `FF`.

$dic = FF::getInstance('Util\Pimple');

// Load the [initialization script](initialization.html) to populate the DIC.
// This is common to all entry-point scripts. We extract this into a separate
// script in `./userdata`, because it is basically a programmatic configuration
// of the library.
require_once USERDATA_DIR.DS.'initialization.php';

// Now we create the necessary adapters. We need one adapter for each action we
// want to query from the FACT-Finder server. Currently, the demo only performs
// a search and displays a tag cloud, so we only need two adapters.
//
// <a name="adapter-dependencies"></a>
// Each adapter has four dependencies:
//
// - The class name of the logger it should use. This class has to implement
//   `Util\LoggerInterface`
// - The configuration object to use. This should implement
//   `ConfigurationInterface`
// - A `Request` object. The adapter will use this object to communicate with the
//   FACT-Finder server. You can obtain one of these from a class implementing
//   the `Core\Server\RequestFactoryInterface`.
// - A `Client\UrlBuilder` which it will use generate links on the
//   page.
//
// These dependencies have been created in the initialization script, so that we
// can simply pull them from the DIC.
//
// In most cases this is all the configuration the adapters need, because the
// `request` is pre-populated with parameters from the client request which
// usually contains everything the adapters need.
$searchAdapter = FF::getInstance(
    'Adapter\Search',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['request'],
    $dic['clientUrlBuilder']
);

$tagCloudAdapter = FF::getInstance(
    'Adapter\TagCloud',
    $dic['loggerClass'],
    $dic['configuration'],
    $dic['request'],
    $dic['clientUrlBuilder']
);

## Preparing the data

// We will now fill a bunch of variables which we can use in the
// templates later on. Most of these variables will be the results from
// our requests to the FACT-Finder server (obtained by the adapters).

// We'll need the encoding for rendering the `Content-Type` meta-tag.
$encoding = $dic['configuration']->getPageContentEncoding();

// This object provides convenient access to several important query
// parameters relating to actual search.
$searchParameters = FF::getInstance(
    'Data\SearchParameters',
    $dic['requestParser']->getRequestParameters()
);

// We'll need the target for the action of the search box form.
$target = $dic['requestParser']->getRequestTarget();

$trackingEvents = array();

// Get or start a session. This is needed for the tracking. If it's
// a new session, mark that event for tracking.
$sid = session_id();
if ($sid === '') {
    session_start();
    $sid = session_id();
    if(!isset($_SESSION['started'])) {
        $trackingEvents['sessionStart'] = array();
        $_SESSION['started'] = true;
    }
}

// The library contains a few "enums" (of course, PHP does not have
// enums, but we've tried to work around them as closely as possible).
// Their values can be obtained from static methods, so we'll need the
// enum's class name.
$searchStatusEnum = FF::getClassName('Data\SearchStatus');

// This function can be used here and in templates get the file names of other
// templates.
function getTemplate($name) {
    return TEMPLATE_DIR.DS.$name.'.phtml';
}

// We also define two exceptions for the following try-catch statement.
class NoQueryException extends \Exception{}
class RedirectException extends \Exception{}

// Activate the output buffer, so that we don't render immediately to
// the response.
ob_start();

// We slightly abuse exception handling for flow control here. If all
// goes well, the entire page will be rendered in the `try` block.
// However, if the search fails, or we need a redirect, or there is
// some actual (unexpected) exception, we'll handle that in the
// appropriate `catch` blocks.
try {
    // Don't even attempt a search if there is no search query.

    /* TODO: Do this inside the Search adapter? */
    if (!$searchParameters->getQuery()
        && !$searchParameters->isNavigationEnabled()
    ) {
        throw new NoQueryException();
    }

    // Get the campaigns first, because they might contain a redirect.
    // If so, exit the `try` block with an appropriate exception.
    $campaigns = $searchAdapter->getCampaigns();
    if ($campaigns->hasRedirect()) {
        throw new RedirectException($campaigns->getRedirectUrl());
    }

    // Now we'll save all the data from our adapters into corresponding
    // variables. The templates will then use these to render the page.
    $status                 = $searchAdapter->getStatus();
    /*$isArticleNumberSearch  = $searchAdapter->isArticleNumberSearch();*/
    $isSearchTimedOut       = $searchAdapter->isSearchTimedOut();

    $productsPerPageOptions = $searchAdapter->getResultsPerPageOptions();
    $breadCrumbTrail        = $searchAdapter->getBreadCrumbTrail();
    $singleWordSearch       = $searchAdapter->getSingleWordSearch();
    $paging                 = $searchAdapter->getPaging();
    $sorting                = $searchAdapter->getSorting();
    $asn                    = $searchAdapter->getAfterSearchNavigation();
    $result                 = $searchAdapter->getResult();

    $tagCloud               = $tagCloudAdapter->getTagCloud();

    /*$util = FF::getInstance('util', $searchAdapter);*/

    // Depending on the status of search, render the appropriate
    // template. There are three different "root" templates (i.e.
    // templates, which include the entire `<html>`-tree):
    //
    // - `index.phtml` is for actual search results.
    // - `noMatch.phtml` is for successful searches that did not yield
    //   any results.
    // - `error.phtml` is for all kinds of problems which may have
    //   occurred.
    switch ($status) {
        case $searchStatusEnum::RecordsFound():
            $trackingEvents['display'] = array();
            include getTemplate('index');
            break;
        case $searchStatusEnum::EmptyResult():
            $message = 'No result for <strong>"'
                     . htmlspecialchars($searchParameters->getQuery())
                     . '"</strong>';
            include getTemplate('noMatch');
            break;
        case $searchStatusEnum::NoResult():
            $error = 'No result - an error occurred...';
            include getTemplate('error');
            break;
        default:
            throw new Exception('No result (unknown status)');
    }
} catch (\Exception $e) {
    // This is some code duplication from the above `switch` statement
    // and handles different exceptions by doing a redirect or rendering
    // the appropriate template.
    if ($e instanceof RedirectException) {
        $url = $e->getMessage();
        if (!headers_sent())
            header('Location: '.$url);
        else
            echo '<meta http-equiv="refresh" content="0; URL='
               . $url . '"> <a href="' . $url . '"></a>';
    } else if($e instanceof NoQueryException) {
        $message = 'Please enter a search query';
        include getTemplate('noMatch');
    } else {
        $error = $e->getMessage();
        include getTemplate('error');
    }
}
// Finally, clean the buffer echo its contents. This string will contain the
// entire HTML page.
$output ob_get_clean();
echo $output;
