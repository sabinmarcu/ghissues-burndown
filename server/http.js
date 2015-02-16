(function() {
    "use strict";
        var DEBUG      = require("debug"),
            Grabber    = require("./grabber"),
            BODYPARSER = require("body-parser"),
            debug      = {
                warning: DEBUG("app:warning:http"),
                error  : DEBUG("app:error:http"),
                log    : DEBUG("app:log:http")
            }, isDebugging = DEBUG.enabled("app:log*"),
            _exists = function (item) { return item !== null && typeof item !== "undefined"; };  
    debug.error.log = console.error.bind(console);


    debug.log("Bootstrapping HTTP Server");
    var HTTPServer = function(host, port, onlyapi) {

        debug.log("Setting up the internals of the server!");
        var apionly = onlyapi !== null && typeof onlyapi !== "undefined" && onlyapi,
            grabbers = {}, expires = {}, compiler = false;

        var createGrabber = function(username, password) {
            var expiration = new Date(); 

            debug.log("Creating a enw Grabber", username, _exists(password));
            if (isDebugging) expiration.setHours(expiration.getHours() + 4);
            else expiration.setHours(expiration.getHours() + 5);

            grabbers[username] = new Grabber(username, password);
            expires[username] = expiration;
            debug.log("Created a new Grabber", grabbers[username].getUUID());
            
            debug.log("Getting Grabber", grabbers[username].getUUID());
            return grabbers[username]; 
        };

        var getGrabber = function(username, password) {

            debug.log("Trying to get a grabber");
            if (_exists(username) && _exists(password)) {

                if (grabbers[username] === null || typeof grabbers[username] === "undefined") return createGrabber(username, password);
                if (grabbers[username].authenticate(username, password)) {
                    debug.log("Getting Grabber", grabbers[username].getUUID());
                    return grabbers[username];
                }

                delete grabbers[username];
                delete expires[username];
                return createGrabber(username, password);
            } else {
                if (grabbers.__empty__ === null || typeof grabbers.__empty__ === "undefined") grabbers.__empty__ = new Grabber();
                debug.log("Getting Grabber (no-auth)", grabbers.__empty__.getUUID());
                return grabbers.__empty__;
            }
        };

        debug.log("Initialising HTTP server", (apionly ? "Running only the APIs, without the static server." : "Running APIs and a static server with the UI."));
        var App = (require("express"))();

        if (isDebugging) {
            App.get("/test", function(req, res) {
                res.send("Hello there, this is just a test message. The server works!");
            });
        }

        debug.log("Setting up API endpoints");
        App.use(BODYPARSER.json());
        App.use(BODYPARSER.urlencoded());
        App.post("/api/:user/:repo", function(req, res) {
            debug.log("Got request for " + req.params.user + "/" + req.params.repo);
            if ( (_exists(req.body.username) && !_exists(req.body.password)) || (_exists(req.body.password) && !_exists(req.body.username)) ) {
                debug.error("There has been a request for " + req.params.user + "/" + req.params.repo + " with inconsistent credentials!");
                res.status(500).end("There was no matching pair of username and password in the request!");
            }

            var grabber;
            debug.log("Do we have a username?", req.body.username, _exists(req.body.username));
            if (_exists(req.body.username)) grabber = getGrabber(req.body.username, req.body.password);
            else grabber = getGrabber();

            grabber.getIssues(req.params.user, req.params.repo, function(results){
                debug.log("Got results from the grabber!", results.HAS_ERROR, results.ALL, results.CLOSED);
                if (results.HAS_ERROR) {
                    res.status(500).end("There has been an error!\t" + results.ERR_MSG + "\n\n" + results.ERR_STACK);
                } else {
                    res.status(200).end(
                        JSON.stringify({
                            total: results.ALL,
                            closed: results.CLOSED,
                            titles: results.getClosedTitles(),
                            dates: results.getClosedDates()
                        })
                    );
                }
            });
        });

        return {
            start: function() {

                debug.log("Starting HTTP server on " + host + ":" + port + " ...");
                try {

                    var sourceInfo = JSON.parse(require("fs").readFileSync(require("path").resolve(__dirname + "/../config/sources.json"), "utf-8"));
                    debug.log("Running in the " + require("path").resolve(__dirname + "/../" + sourceInfo.public.root) + " directory.");

                    if (compiler) {
                        debug.log("Creating the endpoints for dynamic compiling...");
                        var hookPackage = function(pkg, compile) {
                            debug.log("Hooking ", "/" + sourceInfo.public[pkg.folder] + pkg.filename);
                            App.get("/" + sourceInfo.public[pkg.folder] + pkg.filename, function(req, res) {
                                debug.log("Compiling source ", req.url);
                                compile().then(function(source){
                                    res.set("Content-Type", pkg["content-type"] || "application/javascript");
                                    res.status(200).send(source);
                                }, function(error){
                                    res.send(500).end("There has been an error while compiling this file. Check logs for more info!");
                                });
                            });
                        };
                        for (var pkg in sourceInfo.packages) hookPackage(sourceInfo.packages[pkg], compiler[sourceInfo.packages[pkg].compiler || "compile"]);
                    }

                    if (!apionly) {
                        App.get("*", function(req, res) {
                            debug.log("Requested", (require("path").resolve(__dirname + "/../" + sourceInfo.public.root + req.url)));
                            (require("fs")).exists(require("path").resolve(__dirname + "/../" + sourceInfo.public.root + req.url), function(exists) {
                                if (exists && (req.url !== "/")) res.sendFile(require("path").resolve(__dirname + "/../public" + req.url));
                                else {
                                    res.sendFile(require("path").resolve(__dirname + "/../public/index.html"));
                                }
                            });
                        });     
                    }
                    debug.log("These are the process arguments", process.env.PORT, process.env.IP);
                    App.listen(process.env.PORT || port, process.env.IP || host);
                } catch (e) {
                    debug.error("An error has occurred while starting the server.", e.stack);
                }

            }, 
            injectCompiler: function(Compiler) {
                compiler = Compiler;
            }
        };
    };
    debug.log("Finished bootstrapping HTTP Server");

    module.exports = HTTPServer;
})();