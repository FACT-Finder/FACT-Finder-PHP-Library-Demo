function FFSuggest() {
	var pScript;
	var pNewestNumber = 0;
	var pRequestCounter = 0;

	var pRequest;
	var pLayer;
	var pDebug					= false;
	var pInstanceName			= '';
	var pSearchURL				= '';
	var pQueryParamName			= '';
	var pFormName				= '';
	var pLayerName				= '';
	var pQueryInput;
	var pSuggest				= [];
	var pLastQuery;
	var pCurrentSelection		= 0;
	var submitted				= false;
	var pShowImages				= false;
	var	pSearchDelay			= 400; // timer for request-delay between keypresses in milliseconds
	var pTimer					= 0;

	var pSuggestImageClass		= 'suggestImage';
	var pSuggestQueryClass		= 'suggestTextQuery';
	var pSuggestTypeClass		= 'suggestTextType';
	var pSuggestAmountClass		= 'suggestTextAmount';
	var pSuggestQueryTypedClass	= 'suggestTextQueryTyped';
	var pSuggestFooterClass		= 'suggestFooter';
	var pSuggestHeaderClass		= 'suggestHeader';
	var pSuggestRowClass		= 'suggestRow';
	var pSuggestHighlightClass	= 'suggestHighlight';

	var ptranslation;

	this.init = function(searchURL, formName, queryParamName, divLayername, instanceName, debugMode, channelParamName, channel, showImages) {
		pSearchURL			= searchURL;
		pFormName			= formName;
		pQueryParamName		= queryParamName;
		pChannelParamName	= channelParamName;
		pChannel			= channel;
		pLayerName			= divLayername;
		pInstanceName		= instanceName;
		pDebug				= debugMode;
		pShowImages			= showImages;
		if (pSearchURL == '') {
			if (pDebug) alert('no searchURL defined');
			return null;
		} else if (pInstanceName == '') {
			if (pDebug) alert('no instanceName defined');
			return null;
		} else if (pFormName == '') {
			if (pDebug) alert('no formName defined');
			return null;
		} else if (pQueryParamName == '') {
			if (pDebug) alert('no queryParamName defined');
			return null;
		} else if (pLayerName == '') {
			if (pDebug) alert('need a layer for output');
		}
		pQueryInput = document[pFormName][pQueryParamName];
		pQueryInput.onkeyup	= handleKeyPress;
		pQueryInput.onkeydown = checkTab; //tab doesn't work with keyup
		pQueryInput.onfocus	= showLayer;
		pQueryInput.onblur	= hideLayer;
		document[pFormName].onsubmit = handleSubmit;

		ptranslation = {};
		ptranslation['unspecified'] = 'Sonstiges';
		ptranslation['productName'] = 'Produktname';
		ptranslation['brand'] = 'Hersteller';
		ptranslation['content'] = 'Inhalt';
		ptranslation['searchTerm'] = 'Suchbegriff';
		ptranslation['category'] = 'Kategorie';
	};

	function handleSubmit() {
		submitted = true;
		if (pSuggest[pCurrentSelection] != undefined) {

			var url = pSuggest[pCurrentSelection].searchParams;
			url = removeParam(url, 'format');
			url = removeParam(url, '_');
			url = removeParam(url, 'omitContextName');
			url = addParam(url, 'sourceRefKey', pSuggest[pCurrentSelection].refKey);
			url = document[pFormName].action + cutParamsUrl(url);

			window.location = url;
			return false;
		}
	}

	this.handleClick = function() {
		handleSubmit();
	}

	this.handleMouseMove = function(pos) {
		var tblCell = getTableCell(pos);
		unmarkAll();
		if (tblCell != null) {
			highlightSuggest(tblCell);
			pCurrentSelection = pos;
		}
	};

	this.handleMouseOut = function(pos) {
		var tblCell = getTableCell(pos);
		if (tblCell != null) {
			unmarkSuggest(tblCell);
			pCurrentSelection = -1;
		}
	};

	function handleKeyPress(evt) {
		evt = (evt) ? evt : ((event) ? event : null);
		var keyCode = evt.keyCode;
		if (keyCode == 38) {
			moveSelection('up')
		} else if (keyCode == 27) {
			hideLayer();
		} else if (keyCode == 40) {
			moveSelection('down');
		} else {
			if (pLastQuery != pQueryInput.value) {
				clearTimeout(pTimer);

				if (pQueryInput.value == '') {
					hideLayer();
					if (pLayer != null){ pLayer.innerHTML = ''; }
					pLastQuery = '';
					return null;
				}

				// start delay timer
				pTimer = setTimeout(startAjax, pSearchDelay);

				pLastQuery = pQueryInput.value;
			}
		}
	}

	function moveSelection(direction) {
		var pos = pCurrentSelection;
		if (direction == 'up'){ pos--; }
		else{ pos += 1; }

		if (pos < 0) {
			unmarkAll();
			pQueryInput.focus();
			pCurrentSelection	= -1;
		} else {
			var tblCell = getTableCell(pos);
			if (tblCell != null) {
				unmarkAll();
				highlightSuggest(tblCell);
				pCurrentSelection = pos;
			}
		}

		var query = pQueryInput.value;
		pQueryInput.value = '';
		pQueryInput.focus();
		pQueryInput.value = query;
	}

	function startAjax() {
		var query = pQueryInput.value;
		if(query.length > 50 ){ return; }

		var requestURL = pSearchURL +'?omitContextName=true&'+ pQueryParamName +'='+ encodeURIComponent(query) +'&'+ pChannelParamName +'='+ pChannel;

		try {
			pLayer = document.getElementById(pLayerName);
			if (pLayer != null) {
				if (query != '') {
					var randomFuncName = 'suggest_callbackfunc' + pRequestCounter;

					window[randomFuncName] = function(json) {
						// avoid the display of old data
						if (window[randomFuncName].myRequestNumber > pNewestNumber) {
							FFSuggest.handleResponse(json);
							pNewestNumber = window[randomFuncName].myRequestNumber;
						}
						delete window[randomFuncName];
					};

					window[randomFuncName].myRequestNumber = ++pRequestCounter;

					pScript = document.createElement('script');
					pScript.setAttribute("src", requestURL+ "&format=jsonp&callback=" + randomFuncName);
					document.getElementsByTagName("head")[0].appendChild(pScript);

					window.setTimeout(function() {
						if (pDebug && typeof window[randomFuncName] == 'function') {
							alert('Request fehlgeschlagen!');
						}
					}, 5000);
				} else {
					hideLayer();
				}
			} else {
				if (pDebug) alert( 'no layer for output found' );
			}
		} catch( ex ) {
			hideLayer();
			if (ex == undefined) {
				if (pDebug) alert( 'Error: ' + ex.getmessage );
			} else {
				if (pDebug) alert( 'Error: ' + ex );
			}
		}
	}

	function hideLayer() {
		if (pLayer != null) {
			pLayer.style.display = 'none';

			var ovlEl = document.getElementById(pQueryParamName+'Underlay');
			if(ovlEl){
				pQueryInput.style.backgroundColor = ovlEl.style.backgroundColor;
			}

			fireSuggestLayerHidden();
		}
	}

	this.hideLayerOutsideCall = function() {
		if (pLayer != null) {
			pLayer.style.display = 'none';
			fireSuggestLayerHidden();
		}
	};

	function showLayer() {
		if (pLayer != null && pSuggest != null && pSuggest.length >= 1) {
			pLayer.style.display = 'block';
		}
	}

	function callbackAjax() {
		if (submitted == false) {
			if (pRequest.readyState == 4) {
				if (pRequest.status != 200) {
					hideLayer();
					if (pDebug) alert( 'Error (' + pRequest.status + '): ' + pRequest.statusText );
				} else {
					handleResponse(pRequest.responseText);
				}
			}
		}
	}

	// calls the callback for "outside" listeners if the callback is implemented
	function fireSuggestCompleted(suggestLayerIsVisible, suggestResult) {
		if (typeof(onSuggestCompleted) == 'function') {
			onSuggestCompleted(suggestLayerIsVisible, suggestResult);
		}
	}

	// calls the callback for "outside" listeners if the callback is implemented
	function fireSuggestLayerHidden() {
		if (typeof(onSuggestLayerHidden) == 'function') {
			onSuggestLayerHidden();
		}
	}

	FFSuggest.handleResponse = function(jsonObj) {
		var colSpan = 3;
		if(pShowImages){colSpan++;}

		pCurrentSelection = -1;
		var outputText = '<ul class="' + pLayerName + 'List" onMouseDown="' + pInstanceName + '.handleClick();">'
						+ '<li class="'+pSuggestHeaderClass+'" >Vorschl&auml;ge zur Suche...</li>';

		pSuggest = jsonObj;

		var query = pQueryInput.value;
		// if the query contains regular expression metacharacters then escape them.
		// Tip : here all non-alphanumerical characters are escaped.
		query = query.replace(/[^a-zA-Z0-9]/g, "\\$&");
		var cssRowClass = pShowImages?pSuggestRowClass+'WithImage '+pSuggestRowClass:pSuggestRowClass;
		var tabWord='';
		for (var i = 0; i < pSuggest.length; i++) {
			var suggestQuery = jsonObj[i].name;
			var suggestCount = jsonObj[i].hitCount;
			if (suggestCount==0) {
				suggestCount = '';
			}else if (suggestCount==1) {
				suggestCount = '1 Treffer';
			}else {
				var temp = suggestCount;
				suggestCount = '{0} Treffer';
				suggestCount = suggestCount.replace(/\{0\}/,temp);
			}
			var suggestType = ptranslation[jsonObj[i].type];
			if (!suggestType) {
				suggestType = "";
			}

			if(tabWord == ''){
				if(suggestQuery.toLowerCase().indexOf(query.toLowerCase()) == 0 ){
					tabWord = query+suggestQuery.substring(query.length);
				}
			}
			var suggestImageUrl = jsonObj[i].image;

			var id = pLayerName + '_' + i ;

			outputText += '<li id="' + id + '" class="'+cssRowClass+'" onMouseMove="' + pInstanceName + '.handleMouseMove(\''  + i + '\');"'
				+ 'onMouseOut="' + pInstanceName + '.handleMouseOut(\''  + i +'\');">';

			if(pShowImages) {
				outputText += '<span class="'+ pSuggestImageClass +'">';
				if(suggestImageUrl) {
					outputText += '<img src="' + suggestImageUrl + '" alt=""/>';
				}
				outputText += '</span>';
			}

			outputText += '<span class="'+ pSuggestQueryClass +'">' + htmlEncode(suggestQuery).replace(new RegExp("("+query+")","ig"),'<span class="'+pSuggestQueryTypedClass+'">$1</span>') + '</span>'
				+'<span class="'+ pSuggestAmountClass +'">' + suggestCount + '</span>'
				+'<span class="'+ pSuggestTypeClass +'">' + suggestType + '</span>'
				+'</li>';
		}
		outputText += '</ul>';

		if (pSuggest.length >= 1) {
			showLayer();
			pLayer.innerHTML = outputText;

			var ovlEl = document.getElementById(pQueryParamName+'Underlay');
			if(ovlEl){
				ovlEl.value=tabWord;
				if(tabWord){
					pQueryInput.style.backgroundColor = 'transparent';
				}else{
					pQueryInput.style.backgroundColor = ovlEl.style.backgroundColor;
				}
			}

			// calback for "outside" listeners
			fireSuggestCompleted(true, jsonObj);
		} else {
			hideLayer();
			pLayer.innerHTML = '';

			// callback for "outside" listeners
			fireSuggestCompleted(false, jsonObj);
		}
	};

	function highlightSuggest(tblCell) {
		tblCell.className = pSuggestRowClass+' '+pSuggestHighlightClass;
	}

	function unmarkSuggest(tblCell) {
		tblCell.className = pSuggestRowClass;
	}

	function unmarkAll() {
		var tblCell;
		for (var i = 0; i < pSuggest.length; i++) {
			tblCell = getTableCell(i);
			if (tblCell != null) {
				unmarkSuggest(tblCell);
			}
		}
	}

	function getTableCell(pos) {
		var tblCell;
		tblCell = document.getElementById(pLayerName + '_' + pos);
		return tblCell;
	}

	function htmlEncode(value){
		return value.replace('<','&lt;').replace('>','&gt;').replace('&','&amp;');
	}

	function addInputToForm(name, value) {
		var element = document.createElement('input');
		element.name = name;
		element.type = 'hidden';
		element.value = value;
		document[pFormName].appendChild(element);
	}

	function checkTab(evt){
		evt = (evt) ? evt : ((event) ? event : null);
		var keyCode = evt.keyCode;
		if (keyCode == 9) {
			var ovlEl = document.getElementById(pQueryParamName+'Underlay');
			if(ovlEl){
				pQueryInput.value = ovlEl.value;
				return false;
			}
		}
		return true;
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

    function addParam(url, name, value) {
        var pPos = url.indexOf('?');
        if (pPos < 0) {
            url += '?';
        } else {
            url += '&';
        }
        url += encodeURI(name) + '=' + encodeURI(value);
        return url;
    }
}