var DEBUG = require("debug"),
    debug = {
        warning: DEBUG("app:warning:http"),
        error  : DEBUG("app:error:http"),
        log    : DEBUG("app:log:http")
    };    
debug.error.log = console.error.bind(console);


HTTPServer = function(host, server) {
    debug.log("Initialising http server");
    var App = (require("express"))();

};

module.exports = HTTPServer;