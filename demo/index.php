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
// **Here we go:**
namespace FACTFinderDemo;

error_reporting(E_ALL );

// Set up constant with a few useful directory names.
define('DS', DIRECTORY_SEPARATOR);
define('DEMO_DIR', dirname(__FILE__));
define('LIB_DIR', dirname(DEMO_DIR).DS.'lib');
define('TEMPLATE_DIR', DEMO_DIR.DS.'templates');
define('USERDATA_DIR', DEMO_DIR.DS.'userdata');
define('HELPER_DIR', DEMO_DIR.DS.'helper');

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

// The `HtmlGenerator` is only part of the demo, so we still have to load it
// manually.
require_once HELPER_DIR.DS.'HtmlGenerator.php';

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

// Now we use the demo's [HtmlGenerator](HtmlGenerator.html) to actually render
// the requested page.
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
