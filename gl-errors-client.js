var clientErrorStore = require("gl-clients-error-codes");
var HRH = require("msda-http-request-helper");

var ErrorClient = function (config) {
    var me = this;
    me.config = config;
    me.isReady = false;
    me.errorsStore = null;
    me.hrh = new HRH(me.config);
};

var errorClient = ErrorClient.prototype;

errorClient.load = function (cb) {
    var me = this;
    me.hrh.request("errorEntry/find/all", {}, function (err, res) {
        if (err) {
            return cb(err, null);
        }
        loadHandler.call(me, res, cb);
    });
};

var loadHandler = function (res, cb) {
    var me = this;
    var errorsList = {};
    if (res) {
        for (var i = 0; i < res.data.length; i++) {
            errorsList[res.data[i].keyword] = {
                keyword: res.data[i].keyword,
                description: res.data[i].description,
                code: res.data[i].code
            };
        }
        me.errorsStore = errorsList;
        me.isReady = true;
        cb(null, res);
    } else {
        var error = clientErrorStore("DATA_IS_EMPTY", null);
        me.isReady = false;
        cb(error, null);
    }
};

errorClient.getError = function (keywords) {
    var me = this;
    if (me.isReady && me.errorsStore) {
        var keywordList = keywordList.concat(keywords);
        for (var i in keywordList) {
            keywordList[i] = me.get(keywordList[i]);
        }
        return keywordList;
    } else {
        return [clientErrorStore("DATA_NOT_READY", null)];
    }
};

errorClient.get = function (keyword) {
    var me = this;
    if (me.isReady && me.errorsStore[keyword]) {
        return me.errorsStore[keyword];
    } else {
        return clientErrorStore("ERROR_NOT_FOUND", null);
    }
};

module.exports = ErrorClient;