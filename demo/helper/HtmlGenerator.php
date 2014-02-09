<?php
namespace FACTFinderDemo\Helper;

use FACTFinder\Loader as FF;

class HtmlGenerator
{
    private $searchAdapter;
    private $tagCloudAdapter;
    private $requestParser;
    private $templateDir;
    private $pageContentEncoding;
    private $log;

    public function __construct(
        $loggerClass,
        $configuration,
        $requestParser,
        $searchAdapter,
        $tagCloudAdapter,
        $templateDir
    ) {
        $this->log = $loggerClass::getLogger(__CLASS__);

        $this->pageContentEncoding = $configuration->getPageContentEncoding();

        $this->requestParser       = $requestParser;

        $this->searchAdapter       = $searchAdapter;
        $this->tagCloudAdapter     = $tagCloudAdapter;

        $this->templateDir         = $templateDir;
    }

    private function getTemplate($name) {
        return $this->templateDir.DS.$name.'.phtml';
    }

    public function getHtmlCode()
    {
        // ## Rendering the page

        // Activate the output buffer, so that we don't render immediately to
        // the response.
        ob_start();

        // We will now fill a bunch of variables which we can use in the
        // templates later on. Most of these variables will be the results from
        // our requests to the FACT-Finder server (obtained by the adapters).

        // We'll need the encoding for rendering the `Content-Type` meta-tag.
        $encoding = $this->pageContentEncoding;

        // This object provides convenient access to several important query
        // parameters relating to actual search.
        $searchParameters = FF::getInstance(
            'Data\SearchParameters',
            $this->requestParser->getRequestParameters()
        );

        // We'll need the target for the action of the search box form.
        $target = $this->requestParser->getRequestTarget();

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
            $campaigns = $this->searchAdapter->getCampaigns();
            if ($campaigns->hasRedirect()) {
                throw new RedirectException($campaigns->getRedirectUrl());
            }

            // Now we'll save all the data from our adapters into corresponding
            // variables. The templates will then use these to render the page.
            $status                 = $this->searchAdapter->getStatus();
            /*$isArticleNumberSearch  = $this->searchAdapter->isArticleNumberSearch();*/
            $isSearchTimedOut       = $this->searchAdapter->isSearchTimedOut();

            $productsPerPageOptions = $this->searchAdapter->getResultsPerPageOptions();
            $breadCrumbTrail        = $this->searchAdapter->getBreadCrumbTrail();
            $singleWordSearch       = $this->searchAdapter->getSingleWordSearch();
            $paging                 = $this->searchAdapter->getPaging();
            $sorting                = $this->searchAdapter->getSorting();
            $asn                    = $this->searchAdapter->getAfterSearchNavigation();
            $result                 = $this->searchAdapter->getResult();

            $tagCloud               = $this->tagCloudAdapter->getTagCloud();

            /*$util = FF::getInstance('util', $this->searchAdapter);*/

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
                    include $this->getTemplate('index');
                    break;
                case $searchStatusEnum::EmptyResult():
                    $message = 'No result for <strong>"'
                             . htmlspecialchars($searchParameters->getQuery())
                             . '"</strong>';
                    include $this->getTemplate('noMatch');
                    break;
                case $searchStatusEnum::NoResult():
                    $error = 'No result - an error occurred...';
                    include $this->getTemplate('error');
                    break;
                default:
                    throw new Exception('No result (unknown status)');
            }
        } catch (\Exception $e) {
            // This is some code duplication from the above `switch` statement
            // and handles different exceptions by doing a redirect or rendering
            // the appropriate template.
            if ($e instanceof RedirectException) {
                $this->doRedirect($e->getMessage());
            } else if($e instanceof NoQueryException) {
                $message = 'Please enter a search query';
                include $this->getTemplate('noMatch');
            } else {
                $error = $e->getMessage();
                include $this->getTemplate('error');
            }
        }
        // Finally, clean the buffer and return its contents as a string. This
        // string will contain the entire HTML page.
        return ob_get_clean();
    }

    private function doRedirect($url)
    {
        if (!headers_sent()) {
                header('Location: '.$url);
        } else {
                echo '<meta http-equiv="refresh" content="0; URL='.$url.'"> <a href="'.$url.'"></a>';
        }
    }
}

// Unfortunately, PHP does not support internal classes, so we define our own
// Exception types here.
class NoQueryException extends \Exception{}
class RedirectException extends \Exception{}
