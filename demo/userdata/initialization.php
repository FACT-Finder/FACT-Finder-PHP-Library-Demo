<?php
// This script programmatically configures all necessary dependencies. It
// requires that a global variable `$dic` contains an instance of the `Pimple`
// dependency injection container.
//
// In most cases you can just use this setup as is and go ahead and instantiate
// your adapters. However, if you want to swap out some of the dependencies,
// the annotations explain what each dependency is for.
namespace FACTFinderDemo;

// Make our alias for the `Loader` known within this file.
use FACTFinder\Loader as FF;

// Because *Pimple* works by defining as anonymous functions which are not called
// until the dependency is actually needed, we can define them in any order.
// This way, we can start by setting up the dependencies we know we need and add
// their (second-level) dependencies afterwards.

// As explained in the [index.php](index.html#adapter-dependencies), the
// adapters have four dependencies, so let's set those up and fill in their own
// dependencies as we go along.

// First, the adapters need the class name of a logger (as does pretty much any
// other class in the library). Here, we're using a logger that just forwards
// all calls to [*log4php*](https://logging.apache.org/log4php/). While we're at
// it, we'll also configure *log4php*. By default, *Pimple*'s dependencies are
// "shared". That means, the function you store will only be called the first
// time the dependency is requested. The result of the function is then stored
// and returned every time the dependency is needed again. Because we want to
// run this function and configure *log4php* only once (and then just use the
// resulting string over and  over again), this default behavior is exactly what
// we need.
//
// If you want to log the demo itself differently from the library, you have two
// options:
//
// - When you instantiate this logger, you can just give it a unique scope
//   (simply using the namespace `\FACTFinderDemo` will suffice) and configure
//   that scope separately in `./userdata/log4php.xml`.
// - Alternatively, use a different logger class for logging outside of the
//   library.

$dic['loggerClass'] = function($c) {
    $loggerClass = FF::getClassName('Util\Log4PhpLogger');
    $loggerClass::configure(USERDATA_DIR.DS.'log4php.xml');
    return $loggerClass;
};

// Second, adapters need a configuration (again, almost any object in the
// library needs access to the configuration). This demo uses an implementation
// of `ConfigurationInterface` which reads the required data from an XML file -
// in this case `./userdata/config.xml`. We don't want to parse that file every
// time, we need the configuration, so again we use a shared dependency.

$dic['configuration'] = function($c) {
    return FF::getInstance(
        'Core\XmlConfiguration',
        USERDATA_DIR.DS.'config.xml',
        'production'
    );
};

// Third, adapters need a `Request` object. This time, each adapter needs its
// own instance, so we don't want *Pimple*'s default behavior. Instead, we pass
// the function to `$dic->factory()`, which tells *Pimple* to rerun the function
// each time this dependency is needed.
//
// Unless you want to do something fancy with your request, you can use one of
// the request factories provided in the library (and, to be honest, even if you
// do need something fancy, you'd be better off writing a new factory).

$dic['request'] = $dic->factory(function($c) {
    return $c['requestFactory']->getRequest();
});

// Our definition of the `request` dependency just added a new dependency: a
// `requestFactory`. So let's create that next.

// The library comes with a few different request factories of its own. Here, we
// are using an implementation that realise the connection to the FACT-Finder
// server via cURL's *multi interface*, in order to send out all necessary
// requests in parallel. There is also an `EasyCurlRequestFactory`, which uses
// the *easy interface* and sends requests sequentially, as well as a
// `FileSystemRequestFactory`, which is basically a stub and delivers some files
// from your local hard drive instead of going to the FACT-Finder server. The
// latter is, of course, only intended for testing purposes.
//
// If you want to use neither of the above options but, for instance, use
// sockets for your requests, you can implement the
// `Core\Server\RequestFactoryInterface` and use it right here.

$dic['requestFactory'] = function($c) {
    return FF::getInstance(
        'Core\Server\MultiCurlRequestFactory',
        $c['loggerClass'],
        $c['configuration'],
        $c['requestParser']->getRequestParameters()
    );
};

// The last dependency of adapters is a `Client\UrlBuilder`. It generates links
// for the rendered page which point back at the `index.php` with various
// parameters for navigation and search refinement. So let's create a Singleton
// for that, too.

$dic['clientUrlBuilder'] = function($c) {
    return FF::getInstance(
        'Core\Client\UrlBuilder',
        $c['loggerClass'],
        $c['configuration'],
        $c['requestParser'],
        $c['encodingConverter']
    );
};

// These last two dependencies added two more dependencies again. A
// `requestParser`and an `encodingConverter`. Let's add these as well.

// The `Core\Client\RequestParser` reads things like query parameters and the
// target out of the current request. In fact, you may want to use this object
// yourself (and the demo does), because it takes care of determining a few
// interesting parameters for you.

$dic['requestParser'] = function($c) {
    return FF::getInstance(
        'Core\Client\RequestParser',
        $c['loggerClass'],
        $c['configuration'],
        $c['encodingConverter']
    );
};

// Lastly, a derived class of `Core\AbstractEncodingConverter` takes care of
// converting between UTF-8 (used by FACT-Finder and the library) and
// potentially different encodings used on the page and by the client.
//
// This last dependency shows the true power of using anonymous functions to
// define dependencies. We determine dynamically which conversion functions
// are available and instantiate the appropriate implementation. If the more
// powerful `iconv` extension is available we'll use it, but if not we'll also
// check if we can use `utf8_encode`/`utf8_decode` instead.

$dic['encodingConverter'] = function($c) {
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
};

// Now we're set to go and can create the objects we really need.
