function activateInfomodus(){
    $('img#infoButton').attr('src', 'files/images/demoshop/modus_info_on.png');

    bindInfo('#asnColumn', '<h3>ASN group</h3><p>Filter the search results here.</p><p>Click on the individual elements, to set up a filter that will reduce the search result to the desired element.</p><p>To remove the filter again, simply click on the "Remove selection" link.</p>');
    bindInfo('#resultWrap', '<h3>Search result</h3><p>Here the products found by the search request are shown.</p><p>Click on the individual products, to proceed to the Details page.</p><p>To remove items from the search result, proceed to the "Configuration mode" at the top right. A trash can will appear, into which it is possible to drag individual items. For further information, read the Help text, which appears when hovering over the trash can.</p>');
    bindInfo('#breadCrumbTrail', '<h3>Navigation history</h3><p>This area shows the actions you have conducted with the search result.</p><p>Here the search term and the selected filters are shown.</p><p>By clicking the individual elements, it is possible to return to an earlier state.</p>');
    bindInfo('div.sortBox', '<h3>Sort order</h3><p>The sort order to be applied to the search result can be selected here. Sorting by relevance is the default sorting mode.</p>');
    bindInfo('div.paging', '<h3>Paging</h3><p>If the search result has several pages, you can scroll through the search result here.</p>');
}

function deactivateInfomodus(){
    $('img#infoButton').attr('src', 'files/images/demoshop/modus_info_off.png');

    $('div#infoPlaceHolder').html('<h3>Info column</h3><p>When you activate the Help mode, an explanatory text for the elements on this page will appear. Move the mouse cursor over an element to display the help text for that element.</p>');

    unbindInfo('#asnColumn');
    unbindInfo('#resultWrap');
    unbindInfo('#breadCrumbTrail');
    unbindInfo('div.sortBox');
    unbindInfo('div.paging');
}

function bindInfo(object, text){
    $(object).mouseover(function(){
      $('div#infoPlaceHolder').html(text);
    });
    $(object).addClass('infoblock');
}

function unbindInfo(object) {
    $(object).unbind('mouseover');
    $(object).removeClass('infoblock');
}
