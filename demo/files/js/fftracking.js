var tracking = {

    doTrack : function(eventName, channel, sessionId, extraParams) {
        var params = {
            event : eventName,
            channel : channel,
            sid : sessionId
        };
        for ( var param in extraParams) {
            if (extraParams[param] != null)
                params[param] = extraParams[param];
        }
        $.ajax({
            type : "GET",
            url : "tracking.php",
            data : params,
            contentType : "application/x-www-form-urlencoded; charset=UTF-8",
            cache : false,
            async : false
        });
    },

    click : function(channel, sessionId, id, masterId, query, pos, origPos,
            page, origPageSize) {
        this.doTrack('click', channel, sessionId, {
            id : id,
            masterId : masterId,
            query : query,
            pos : pos,
            origPos : origPos,
            page : page,
            origPageSize : origPageSize
        });
    },

    recommendationClick : function(channel, sessionId, id, masterId, mainId) {
        this.doTrack('recommendationClick', channel, sessionId, {
            id : id,
            masterId : masterId,
            mainId : mainId
        });
    },

    cart : function(channel, sessionId, id, masterId, count, price, query) {
        this.doTrack('cart', channel, sessionId, {
            id : id,
            masterId : masterId,
            count : count,
            price : price,
            query : query
        });
    },

    directCart : function(channel, sessionId, id, masterId, query, pos,
            origPos, page, origPageSize, count, price) {
        this.click(channel, sessionId, id, masterId, query, pos, origPos, page,
                origPageSize);
        this.cart(channel, sessionId, id, masterId, count, price, query);
    },

    checkout : function(channel, sessionId, id, masterId, count, price, query, userId) {
        this.doTrack('checkout', channel, sessionId, {
            id : id,
            masterId : masterId,
            count : count,
            price : price,
            query : query,
            userId : userId
        });
    },

    login : function(channel, sessionId, userId) {
        this.doTrack('login', channel, sessionId, {
            userId : userId
        });
    }
}