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
        ob_start();

        // For rendering the Content-Type meta-tag
        $encoding = $this->pageContentEncoding;
        $searchParameters = FF::getInstance(
            'Data\SearchParameters',
            $this->requestParser->getRequestParameters()
        );

        $trackingEvents = array();

        // Demo session, needed to make tracking work
        $sid = session_id();
        if ($sid === '') {
            session_start();
            $sid = session_id();
            if(!isset($_SESSION['started'])) {
                $trackingEvents['sessionStart'] = array();
                $_SESSION['started'] = true;
            }
        }

        $searchStatusEnum = FF::getClassName('Data\SearchStatus');

        try {
            // TODO: Do this inside the Search adapter?
            if (!$searchParameters->getQuery()
                && !$searchParameters->isNavigationEnabled()
            ) {
                throw new NoQueryException();
            }

            $campaigns = $this->searchAdapter->getCampaigns();
            if ($campaigns->hasRedirect()) {
                throw new RedirectException($campaigns->getRedirectUrl());
            }

            $status                 = $this->searchAdapter->getStatus();
            //$isArticleNumberSearch  = $this->searchAdapter->isArticleNumberSearch();
            $isSearchTimedOut       = $this->searchAdapter->isSearchTimedOut();

            $productsPerPageOptions = $this->searchAdapter->getResultsPerPageOptions();
            $breadCrumbTrail        = $this->searchAdapter->getBreadCrumbTrail();
            $singleWordSearch       = $this->searchAdapter->getSingleWordSearch();
            $paging                 = $this->searchAdapter->getPaging();
            $sorting                = $this->searchAdapter->getSorting();
            $asn                    = $this->searchAdapter->getAfterSearchNavigation();
            $result                 = $this->searchAdapter->getResult();

            $tagCloud               = $this->tagCloudAdapter->getTagCloud();

            //$util = FF::getInstance('util', $this->searchAdapter);

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

// internal class are not allowed in php :(
class NoQueryException extends \Exception{}
class RedirectException extends \Exception{}
