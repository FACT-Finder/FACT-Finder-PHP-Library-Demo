function FFSuggest() {

var pDebug					= false;
var pInstanceName			= '';
var pSearchURL				= '';
var pQueryParamName			= '';
var pFormname 				= '';
var pLayerName				= '';
var pQueryInput;
var pSuggest				= new Array();
var pLastQuery;
var submitted				= false;
var pShowImages				= false;
var pCurrentSelection		= -1;

var pSuggestImageClass 		= 'suggestImage';
var pSuggestQueryClass 		= 'suggestTextQuery';
var pSuggestTypeClass 		= 'suggestTextType';
var pSuggestAmountClass     = 'suggestTextAmount';
var pSuggestQueryTypedClass = 'suggestTextQueryTyped';
var pSuggestFooterClass     = 'suggestFooter';
var pSuggestHeaderClass     = 'suggestHeader';
var pSuggestRowClass	    = 'suggestRow';
var pSuggestHighlightClass  = 'suggestHighlight';
var pSuggestLayerBlockText	= 'suggestLayerBlockText';
var pSuggestLayerBlockImage	= 'suggestLayerBlockImage';
var pSuggestParCatClass 	= 'suggestParentCategory';

var ptranslation;

this.init = function(searchURL, formname, queryParamName, divLayername, instanceName, debugMode, channelParamName, channel, showImages, sid, site) {
	pSearchURL			= searchURL;
	pFormname			= formname;
	pQueryParamName		= queryParamName;
	pChannelParamName	= channelParamName;
	pChannel			= channel;
	pLayerName			= divLayername;
	pInstanceName		= instanceName;
	pDebug				= debugMode;
	pShowImages			= showImages;
	pSid				= sid;
	pSite				= site;

	if (pSearchURL == '') {		
		if (pDebug) alert('no searchurl defined');
		return null;
	} else if (pInstanceName == '') {
		if (pDebug) alert('no instancename defined');
		return null;
	} else if (pFormname == '') {
		if (pDebug) alert('no formname defined');
		return null;
	} else if (pQueryParamName == '') {
		if (pDebug) alert('no queryparamname defined');
		return null;
	} else if (pLayerName == '') {
		if (pDebug) alert('need a layer for output');
	}
	pQueryInput = document[pFormname][pQueryParamName];
	$(pQueryInput).keyup(function(ev){handleKeyPress(ev);});
	$(pQueryInput).keydown(function(ev){return checkTab(ev);}); //tab doesn't work with keyup
	$(pQueryInput).focus(function(){showLayer();});
	$(pQueryInput).blur(function(){hideLayer();});
	$(document[pFormname]).submit(function(){return handleSubmit();});
	
	ptranslation = new Object();
	
		ptranslation['brand.headline'] = 'Markenvorschläge';
	
		ptranslation['searchTerm.headline'] = 'Suchvorschläge';
	
		ptranslation['category'] = 'Kategorie';
	
		ptranslation['productName'] = 'Produktname';
	
		ptranslation['unspecified'] = 'Sonstiges';
	
		ptranslation['productName.headline'] = 'Produktvorschläge';
	
		ptranslation['brand'] = 'Hersteller';
	
		ptranslation['content'] = 'Inhalt';
	
		ptranslation['category.headline'] = 'Kategorievorschläge';
	
		ptranslation['searchTerm'] = 'Suchbegriff';
	
}

function handleSubmit() {
	if (pSuggest[pCurrentSelection] != undefined) {
		var url = fireSubmitSuggest(pSuggest[pCurrentSelection]);
		if(url == null || url == ''){
			url = pSuggest[pCurrentSelection].searchParams;
			url = removeParam(url, 'format');
			url = removeParam(url, '_');
			url = removeParam(url, 'omitContextName');
			url = document[pFormname].action + cutParamsUrl(url);
			// It should be noted that the Detail url info is added in onSubmit above
			url = addTrackingInformationToSearchUrl(url);
		}

		url = addGeneralTrackingInformationToUrl(url);

		window.location = url;
		return false;
	}
	return true;
}

function addTrackingInformationToSearchUrl(url) {
	url = addParam(url, 'queryFromSuggest', 'true');
	url = addParam(url, 'userInput', pLastQuery);
	url = addParam(url, 'ignoreForCache', 'userInput');
	url = addParam(url, 'ignoreForCache', 'queryFromSuggest');
	return url;
}

function addGeneralTrackingInformationToUrl(url) {
	if (pSid) { url = addParam(url, 'sid', pSid); }
	return url;
}

this.handleClick = function() {
	if($('li.'+pSuggestHighlightClass).length > 0){
		pCurrentSelection = $('li.'+pSuggestHighlightClass)[0].id.replace(pLayerName+'_', '');
	}
	$(document[pFormname]).submit();
}

this.handleMouseMove = function(id) {
	unmarkAll();
	$('#'+pLayerName+' li[id="'+id+'"]').addClass(pSuggestHighlightClass);
}

this.handleMouseOut = function(id) {
	$('#'+pLayerName+' li[id="'+id+'"]').removeClass(pSuggestHighlightClass);
	pCurrentSelection = -1;
}

function handleKeyPress(evt) {
	evt = (evt) ? evt : ((event) ? event : null);
	var keyCode = evt.keyCode;
	if (keyCode == 38) {
		moveUp();
	} else if (keyCode == 27) {
		hideLayer();
	} else if (keyCode == 40) {
		moveDown();
	} else if (keyCode == 37) {
		moveLeft();
	} else if (keyCode == 39) {
		moveRight();
	} else {
		if (pQueryInput.value == '') {
			hideLayer();
			pLastQuery = '';
			return null;
		}
		if (pLastQuery != pQueryInput.value){ getSuggestions(); }
		pLastQuery = pQueryInput.value;
	}
}

function checkTab(evt){
	evt = (evt) ? evt : ((event) ? event : null);
	var keyCode = evt.keyCode;
	if (keyCode == 9) {	
		var ovlEl = $('input#'+pQueryParamName+'Underlay');
		if(ovlEl.length > 0){		
			$('input[name='+pQueryParamName+']').attr('value', ovlEl.attr('value'));
			return false;
		}
	}
	return true;
}

function moveUp(){
	if($('#'+pLayerName).is(':visible')){
		if($('li.'+pSuggestHighlightClass).length == 0) {
		 	$('li.'+pSuggestRowClass+':last').addClass(pSuggestHighlightClass);
	 	} else {
	 		var listWithSelection = $('li.'+pSuggestHighlightClass).parent('ul');
	 		var prevEl = $('li.'+pSuggestHighlightClass).prevAll('li.'+pSuggestRowClass);
		 	if(prevEl.length == 0) {
			 	$('li.'+pSuggestHighlightClass).removeClass(pSuggestHighlightClass);
			 	listWithSelection.find('li.'+pSuggestRowClass+':last').addClass(pSuggestHighlightClass);
			 } else {
			 	$('li.'+pSuggestHighlightClass).removeClass(pSuggestHighlightClass);
		 		$(prevEl[0]).addClass(pSuggestHighlightClass);
		 	}	
	 	}
	 	pCurrentSelection = getCurrentSelection();
 	}
}

function moveDown() {
	if($('#'+pLayerName).is(':visible')){
		if($('li.'+pSuggestHighlightClass).length == 0){
		 	$('li.'+pSuggestRowClass+':first').addClass(pSuggestHighlightClass);
	 	} else {
	 		var listWithSelection = $('li.'+pSuggestHighlightClass).parent('ul');
	 		var nxtEl = $('li.'+pSuggestHighlightClass).nextAll('li.'+pSuggestRowClass);
		 	if(nxtEl.length == 0) {
			 	$('li.'+pSuggestHighlightClass).removeClass(pSuggestHighlightClass);
			 	listWithSelection.find('li.'+pSuggestRowClass+':first').addClass(pSuggestHighlightClass);
		 	} else {
			 	$('li.'+pSuggestHighlightClass).removeClass(pSuggestHighlightClass);
		 		$(nxtEl[0]).addClass(pSuggestHighlightClass);
		 	}
	 	}
	 	pCurrentSelection = getCurrentSelection();
 	}
}

// calls the callback for "outside" listeners if the callback is implemented
function moveLeft(){
	if (typeof(moveHorizontalInSuggestBox) == 'function') {
		moveHorizontalInSuggestBox();
	}
}

// calls the callback for "outside" listeners if the callback is implemented
function moveRight(){
	if (typeof(moveHorizontalInSuggestBox) == 'function') {
		moveHorizontalInSuggestBox();
	}
}

function getCurrentSelection() {
	var selection = -1;
	var highlightId = $('li.'+pSuggestHighlightClass).attr('id');
	if(highlightId){
		selection = highlightId.slice(highlightId.lastIndexOf('_')+1, highlightId.length);
	}
	return selection;
}

function cutParamsUrl(param){
	var qPos = param.indexOf('?');
	if(qPos>=0){
		return param.substring(qPos);
	}else{
		return param;
	}		
}

function removeParam(param, name){
	var pPos = param.indexOf('?'+name);
	if(pPos>=0){
		var f = param.substring(0, pPos);
		pPos = param.indexOf('&', pPos+1);
		if(pPos>=0){
			param = f+param.substring(pPos);
		}					
	}else{
		pPos = param.indexOf('&'+name);
		if(pPos>=0){
			var f = param.substring(0, pPos);
			pPos = param.indexOf('&', pPos+1);
			if(pPos>=0){
				param = f+param.substring(pPos);
			}
		}
	}
	return param;
}

function hideLayer() {
	unmarkAll();
	$('div#'+pLayerName).hide();
	fireSuggestLayerHidden();
	
	var ovlEl = $('input#'+pQueryParamName+'Underlay');
	if(ovlEl.length > 0){
		$('input[name='+pQueryParamName+']').css('background-color', ovlEl.css('background-color'));
	}
}

this.hideLayerOutsideCall = function() {
	hideLayer();
}

function showLayer() {
	$('div#'+pLayerName).show();
}

// calls the callback for "outside" listeners if the callback is implemented
function fireSuggestCompleted(suggestLayerIsVisible) {
	if (typeof(onSuggestCompleted) == 'function') {
		onSuggestCompleted(suggestLayerIsVisible);
	}
}

// calls the callback for "outside" listeners if the callback is implemented
function fireSuggestLayerHidden() {
	if (typeof(onSuggestLayerHidden) == 'function') {
		onSuggestLayerHidden();
	}
}

function fireSubmitSuggest(chosenJson) {
	if (typeof(onSubmitSuggest) == 'function') {
		return onSubmitSuggest(chosenJson);
	}
}

function unmarkAll() {
	$('li.'+pSuggestHighlightClass).each(function(i) {
		$(this).removeClass(pSuggestHighlightClass).addClass(pSuggestRowClass);			
	});
}

function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function addParam(url, paramName, paramValue) {
	if(paramName && paramValue) {
		var newParam = encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
		if (url.indexOf('?') !== -1) {
			url += '&' + newParam;
		} else {
			url += '?' + newParam;
		}
	}
	return url;
}

	
	function getSuggestions(){
		var query = $('input[name='+pQueryParamName+']').val();;
		//check if the same query was asked before
		if(pLastQuery == query){
			return;
		}else {
			pLastQuery = query;
		}

		
		var requestURL = pSearchURL +'?'+ pQueryParamName +'='+ encodeURIComponent(query) +'&'+ pChannelParamName +'='+ pChannel+'&format=jsonp&callback=?&omitContextName=true';
		
		requestURL = addGeneralTrackingInformationToUrl(requestURL);

		$.getJSON(requestURL,
			function (jsonObj, textStatus) {
					pCurrentSelection = -1;
					var suggestions =  jsonObj != null && jsonObj.suggestions ? jsonObj.suggestions : jsonObj;
					if (suggestions != null && suggestions.length > 0) {
						//create output text
						//var outputText = '<ul class="' + pLayerName + 'Block" onMouseDown="' + pInstanceName + '.handleClick();">';
						var outputText = '<div class="' + pLayerName + 'Block clearfix" onMouseDown="' + pInstanceName + '.handleClick();">';
						
						pSuggest = new Array();
						var lastType='';
						var tabWord='';
						var outputTextText = '';
						var outputTextImg =  '';
						var outputTextTemp =  '';
						var blockImgBorder = '';
						
						// if the query contains regular expression metacharacters then escape them.
						query = query.replace(/[^a-zA-Z0-9]/g, "\\$&");
						for (var i=0; i<suggestions.length; i++) {
						
							var suggestQuery = suggestions[i].name;
							if(tabWord == ''){
								if(suggestQuery.toLowerCase().indexOf(query.toLowerCase()) == 0 ){
									tabWord = query+ suggestQuery.substring(query.length);
								}						
							}
												
							var suggestType = suggestions[i].type;
							if(suggestType != lastType){
								var suggestTypeHead = ptranslation[suggestType+'.headline'];
								if(!suggestTypeHead){
									suggestTypeHead = suggestType;
								}
								outputTextTemp += '<li class="suggestHeader">'+suggestTypeHead+'</li>';
								lastType = suggestType;
							}
							
							var id = pLayerName + '_' + i ;
							
							if(suggestType == 'productName') {
								//outputText += getSuggestHtml_productName(id, query, suggestions[i]);
								outputTextImg += outputTextTemp;
								outputTextImg += getSuggestHtml_productName(id, query, suggestions[i]);
							} else {
								//outputText += getSuggestHtml_fallback(id, query, suggestions[i]);
								outputTextText += outputTextTemp;
								outputTextText += getSuggestHtml_fallback(id, query, suggestions[i]);
							}
							var outputTextTemp =  '';
							
							pSuggest[i] = suggestions[i];
						}
						//outputText += '</ul>';
						if ( outputTextText != '') {
							outputText += '<ul class="' + pLayerName + 'BlockText">' + outputTextText + '</ul>';
						} else {
							blockImgBorder = 'noborder';
						}
						if ( outputTextImg != '') {
							outputText += '<ul class="' + pLayerName + 'BlockImage ' + blockImgBorder + ' ">' + outputTextImg + '</ul>';
						}
						outputText += '</div><!-- EO .suggestLayerBlock -->';
						
						//show layer
						$('div#'+pLayerName).html(outputText).show();
						
						var ovlEl = $('input#'+pQueryParamName+'Underlay');
						if(ovlEl.length > 0){
							ovlEl.attr('value', tabWord);
							if(tabWord){
								$('input[name='+pQueryParamName+']').css('background-color', 'transparent');
							}else{
								$('input[name='+pQueryParamName+']').css('background-color', ovlEl.css('background-color'));
							}
						}					
					} else {
						hideLayer();
					}
				}
			)
			.error(function (e, xhr, settings, exception) {
				if(pDebug){ alert('Error:\nHTTP result code: ' + e.status+'\nrequested URL: '+requestURL);}
			});
	}

	
	function getSuggestHtml_fallback(id, query, jsonSug){
		var suggestQuery = jsonSug.name;
		var suggestCount = jsonSug.hitCount;
		if (suggestCount==0) {
			suggestCount = '&nbsp;';
		}else if (suggestCount==1) {
			suggestCount = 'Ein Produkt';
		}else {
			var temp = suggestCount;
			suggestCount = '{0} Produkte';
			suggestCount = suggestCount.replace(/\{0\}/,temp);
		}

		var encodedQuery = htmlEncode(query);

		var html = '<li id="' + id + '" class="'+pSuggestRowClass+' suggestRowWithoutImage" onMouseMove="' + pInstanceName + '.handleMouseMove(\'' + id + '\');"'
				+ 'onMouseOut="' + pInstanceName + '.handleMouseOut(\'' + id +'\');">'
				+ '<span class="'+ pSuggestQueryClass +'">' + htmlEncode(suggestQuery).replace(new RegExp("("+encodedQuery+")","ig"),'<span class="'+pSuggestQueryTypedClass+'">$1</span>') + '</span>'
				+ getParentCategoryHtml(jsonSug)
				+'<span class="'+ pSuggestAmountClass +'">' + suggestCount + '</span>';
		return html;
	}
	
	function getSuggestHtml_productName(id, query, jsonSug){
		var suggestQuery = jsonSug.name;

		// this is needed to later remove the image tag from the DOM, if the specified image does not exist
		var suggestImageUrl = jsonSug.image;
		var suggestImage = new Image();
		suggestImage.onerror=function() {
			$('#' + this.parentId + ' img').first().remove();
		};
		
		if(suggestImageUrl) {
			suggestImage.src = suggestImageUrl;
			suggestImage.parentId = id;
		}
		
		var encodedQuery = htmlEncode(query);
		
		var html = '<li id="' + id + '" class="'+pSuggestRowClass+' '+pSuggestRowClass+'WithImage" onMouseMove="' + pInstanceName + '.handleMouseMove(\'' + id + '\');"'
				+ 'onMouseOut="' + pInstanceName + '.handleMouseOut(\'' + id +'\');">'
				+ '<span class="'+ pSuggestImageClass +'">';
		if(suggestImageUrl) {
			html += '<img src="' + suggestImageUrl + '" alt=""/>';
		}
		html += '</span>'
			+ '<span class="'+ pSuggestQueryClass +'">' + htmlEncode(suggestQuery).replace(new RegExp("("+encodedQuery+")","ig"),'<span class="'+pSuggestQueryTypedClass+'">$1</span>') + '</span>';
		
		return html;
	}
	
	function getParentCategoryHtml(jsonSug){
		var parCat = jsonSug.attributes['parentCategory'];
		var parCatHtml = '';
		if(parCat != null) {
			parCat = parCat.replace(/\//g, ' > ');
			parCatHtml = '<span class="'+pSuggestParCatClass+'">'+decodeURIComponent(parCat)+'<\/span>';
		}
		return parCatHtml;
	}
	
	function onSubmitSuggest(chosenJson){		
		var dplnk = pSuggest[pCurrentSelection].attributes['deeplink'];
		if (dplnk != null){ 
			return dplnk;
		}
	}
	
	function moveHorizontalInSuggestBox() {
		var numBlockTextElements = $('ul.' + pSuggestLayerBlockText  + ' li.' + pSuggestRowClass).length;
		var numBlockImageElements = $('ul.' + pSuggestLayerBlockImage + ' li.' + pSuggestRowClass).length;

		if(numBlockTextElements > 0 && numBlockImageElements > 0) {
			var isHighlighted = $('li.'+pSuggestHighlightClass).length > 0;
			if(!isHighlighted) {
			 	$('ul.' + pSuggestLayerBlockImage + ' li.'+pSuggestRowClass+':first').addClass(pSuggestHighlightClass);
		 	} else if(isHighlighted) {
				var isInBlockImage = $('ul.' + pSuggestLayerBlockImage + ' li.' + pSuggestHighlightClass).length > 0;
			 	$('li.'+pSuggestHighlightClass).removeClass(pSuggestHighlightClass);
			 	if(isInBlockImage) {
				 	$('ul.' + pSuggestLayerBlockText + ' li.'+pSuggestRowClass+':first').addClass(pSuggestHighlightClass);
			 	} else {
				 	$('ul.' + pSuggestLayerBlockImage + ' li.'+pSuggestRowClass+':first').addClass(pSuggestHighlightClass);
			 	}
		 	}
		 	pCurrentSelection = getCurrentSelection();
	 	}
	}
}