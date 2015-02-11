var API   = require("github"),
    DEBUG = require("debug"),
    UUID  = require("node-uuid"),
    debug = {
        warning: DEBUG("app:warning:grabber"),
        error  : DEBUG("app:error:grabber"),
        log    : DEBUG("app:log:grabber")
    };    
debug.error.log = console.error.bind(console);

debug.log("Initialising the Grabber Module");
Grabber = function (username, password) {

    var uuid = UUID.v1(),
        debug = {
            warning: DEBUG("app:warning:grabber:" + uuid),
            error  : DEBUG("app:error:grabber:" + uuid),
            log    : DEBUG("app:log:grabber:" + uuid)
        };    

    debug.log("Setting up a new API endpoint.", (((username !== null && typeof username !== "undefined") && (password !== null && typeof password !== "undefined")) ? "Will be using a username and password (" + username + ")" : "Will not be using a username"));
    var api = new API({
        version: "3.0.0",
        protocol: "https",
        timeout: 5000,
    });

    if ((username === null || typeof username === "undefined") || (password === null || typeof password === "undefined")) 
        debug.warning("Requests will not work on private repos you have access to!");
    else {
        debug.log("Authenticating...");
        api.authenticate({
            type: "basic",
            username: username,
            password: password
        });
    }

    _getIssues = function(username, repository, page, callback) {
        api.issues.repoIssues({
            repo: repository,
            user: username,
            state: "all", 
            since: "2014-05-01T00:00Z", 
            per_page: 100,
            page: page
        }, function(err, list) {
            if (err) {
                debug.error("There has been an error : " + err.stack);
            } else {                
                if (list.length > 0) {
                    _getIssues(username, repository, page + 1, function(prevall, prevclosed, closedarr) {
                        if (prevall     === null || typeof prevall      === "undefined") prevall = 0;
                        if (prevclosed  === null || typeof prevclosed   === "undefined") prevclosed = 0;
                        if (closedarr   === null || typeof closedarr    === "undefined") closedarr = [];
                        callback(
                            prevall + list.length,
                            prevclosed + list.filter(function(item) { if (item.state == "closed") return item; return null;}).length,
                            closedarr.concat(list.filter(function(item) { if (item.state == "closed") return item; return null;}))
                        );
                    });
                } else callback();
            }
        });
    }; 

    return {
        getIssues: function(username, repository, callback) {
            debug.log("Getting issues for " + username + "/" + repository);
            _getIssues(username, repository, 1, function(all, closed, closedarr) {
                callback(new GrabbedSet(all, closed, closedarr));
            });
        }
    };
};

GrabbedSet = function(all, closed, closedarr) {
    return {
        ALL: all,
        CLOSED: closed,
        getClosedDates: function() { return closedarr.map(function(item) { return item.closed_at; } ); },
        getClosedTitles: function() { return closedarr.map(function(item) { return item.title; } ); }
    };
};
debug.log("Grabber Module Initialised!");

module.exports = Grabber;