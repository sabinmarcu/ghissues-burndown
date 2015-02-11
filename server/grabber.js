(function() {
    "use strict";
        var API   = require("github"),
        DEBUG = require("debug"),
        UUID  = require("node-uuid"),
        debug = {
            warning: DEBUG("app:warning:grabber"),
            error  : DEBUG("app:error:grabber"),
            log    : DEBUG("app:log:grabber")
        },
        _exists = function (item) { return item !== null && typeof item !== "undefined"; };    
    debug.error.log = console.error.bind(console);

    debug.log("Initialising the Grabber Module");
    var Grabber = function (username, password) {

        var uuid = UUID.v1(),
            debug = {
                warning: DEBUG("app:warning:grabber:" + uuid),
                error  : DEBUG("app:error:grabber:" + uuid),
                log    : DEBUG("app:log:grabber:" + uuid)
            };    

        debug.log("Parameters", username, password);
        debug.log("Setting up a new API endpoint.", ((_exists(username) && _exists(password)) ? "Will be using a username and password (" + username + ")" : "Will not be using a username"));
        var api = new API({
            version: "3.0.0",
            protocol: "https",
            timeout: 5000,
        });

        if (!_exists(username) && !_exists(password)) 
            debug.warning("Requests will not work on private repos you have access to!");
        else {
            debug.log("Authenticating...");
            api.authenticate({
                type: "basic",
                username: username,
                password: password
            });
        }

        var _authenticate = function(u, p) {
        };

        var _getIssues = function(username, repository, page, callback) {
            api.issues.repoIssues({
                repo: repository,
                user: username,
                state: "all", 
                since: "1990-01-01T00:00Z", 
                per_page: 100,
                page: page
            }, function(err, list) {
                if (err) {
                    debug.error("There has been an error : " + err.stack);
                    callback(err);
                } else {                
                    if (list.length > 0) {
                        _getIssues(username, repository, page + 1, function(err, prevall, prevclosed, arr) {
                            if (!_exists(prevall))      prevall    = 0;
                            if (!_exists(prevclosed))   prevclosed = 0;
                            if (!_exists(arr))          arr        = [];
                            callback(
                                null,
                                prevall + list.length,
                                prevclosed + list.filter(function(item) { if (item.state == "closed") return item; return null;}).length,
                                arr.concat(list.filter(function(item) { if (item.state == "closed") return item; return null;}))
                            );
                        });
                    } else callback(null, 0, 0, []);
                }
            });
        }; 

        return {
            getUUID: function() { return uuid; },
            authenticate: function(u, p) { return u === username && p === password; },
            getIssues: function(username, repository, callback) {
                debug.log("Getting issues for " + username + "/" + repository);
                _getIssues(username, repository, 1, function(err, all, closed, arr) {
                    debug.log("Got results, creating result set", err, all, closed, _exists(arr));
                    callback(new GrabbedSet(err, all, closed, arr));
                });
            }
        };
    };

    var GrabbedSet = function(err, all, closed, arr) {
        var ret = {
            HAS_ERROR:       _exists(err),
            ALL:             all,
            CLOSED:          closed,
            getClosedDates:  function() { return arr.map(function(item) { return item.closed_at; } ); },
            getClosedTitles: function() { return arr.map(function(item) { return item.title; } ); }
        };
        if (ret.HAS_ERROR) {
            ret.ERROR     = err;
            ret.ERR_MSG   = err.message;
            ret.ERR_STACK = err.stack;
        }
        return ret;
    };
    debug.log("Grabber Module Initialised!");

    module.exports = Grabber;
})();