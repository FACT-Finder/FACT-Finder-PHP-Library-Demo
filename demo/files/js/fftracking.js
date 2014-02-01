function trackEvent(eventName, sourceRefKey, sessionId, channel, extraParams) {
    var request;
    var debug      = false;

    var requestUrl = 'tracking.php?';
    requestUrl += 'event=' + eventName;
    requestUrl += '&sourceRefKey=' + sourceRefKey;
    requestUrl += '&channel=' + channel;
    requestUrl += '&sid=' + sessionId;

    for (var param in extraParams) {
        if (extraParams[param] != null)
            requestUrl += '&' + param + '=' + extraParams[param];
    }

    try {

        if( window.XMLHttpRequest ) {
            request = new XMLHttpRequest();
        } else if( window.ActiveXObject ) {
            request = new ActiveXObject( "Microsoft.XMLHTTP" );
        } else {
            if (debug) alert( 'no ajax connection' );
        }

        if (request != null) {
            request.open( "GET", requestUrl, false );
            request.send( null );
        }
    } catch( ex ) {
        if (ex != undefined) {
            if (debug) alert( 'Error: ' + ex.getmessage );
        } else {
            if (debug) alert( 'Error: ' + ex );
        }
    }
}

// deprecated as of 6.9
function clickProduct(query, artId, artPos, artOrigPos, pageNum, artSimi, sessionId, artTitle, pageSize, origPageSize, channel, eventName){
    debug      = false;
    request    = null;
    requestUrl = 'tracking.php';
    requestUrl += '?query=' + query;
    requestUrl += '&id=' + artId;
    requestUrl += '&pos=' + artPos;
    requestUrl += '&origPos=' + artOrigPos;
    requestUrl += '&page=' + pageNum;
    requestUrl += '&simi=' + artSimi;
    requestUrl += '&sid=' + sessionId;
    requestUrl += '&title=' + artTitle;
    requestUrl += '&pageSize=' + pageSize;
    requestUrl += '&origPageSize=' + origPageSize;
    requestUrl += '&channel=' + channel;
    requestUrl += '&event=' + eventName;

    try {
        if( window.XMLHttpRequest ) {
            request = new XMLHttpRequest();
        } else if( window.ActiveXObject ) {
            request = new ActiveXObject( "Microsoft.XMLHTTP" );
        } else {
            if (debug) alert( 'no ajax connection' );
        }

        if (request != null) {
            request.open( "GET", requestUrl, false );
            request.send( null );
        }
    } catch( ex ) {
        if (ex != undefined) {
            if (debug) alert( 'Error: ' + ex.getmessage );
        } else {
            if (debug) alert( 'Error: ' + ex );
        }
    }
}