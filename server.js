(function(){ 
    "use strict";

    var info    = process.appinfo = require("./package.json"),
        args    = process.args    = (new (require("cliparser"))(process.argv)).link({
            "-v": "--version",
            "-h": "--help",
            "-p": "--port",
            "-H": "--host",
            "-V": "--verbose",
            "-u": "--username",
            "-P": "--password",
            "-r": "--repository",
            "-a": "--api-only",
            "-s": "--server",
            "-c": "--compile",
            "-b": "--bundle",
            "-t": "--test"
        }).booleanify().doubleDashArgs;

    var host    = args.host || process.env.IP || "0.0.0.0",
        port    = parseInt(args.port || process.env.PORT || "8000"),
        verbose = args.verbose || process.env.DEBUG || false,
        DEBUG   = require("debug");

    process.env.PORT = port;
    process.env.IP   = host;

    DEBUG.enable("app:error*");
    DEBUG.enable("app:warning*");
    if (verbose) DEBUG.enable("app:log*");
    var debug = {
            warning: DEBUG("app:warning:main"),
            error  : DEBUG("app:error:main"),
            log    : DEBUG("app:log:main")
        };  
    debug.error.log = console.error.bind(console); 

    debug.log("Bootstrapping Application");
    if (args.version) {
        debug.log("Displaying Version");
        console.log(info.version);
    } else if (args.help) {
        debug.log("Displaying Help");
        // require("./help")(info); // TODO do the help
    } else if (args.test) {
        // User this part whenever you want to test something quickly
    } else if (args.server) {

        debug.log("The application is starting up online...");
        var Grabber = require("./server/grabber");

        if (args.repository !== null && typeof args.repository !== "undefined") {

            debug.log("Accessing information from the command line!");

            try {

                debug.log("Figuring out the repository (" + args.repository + ")");
                var repo = ("" + args.repository).split("/");

                if (repo.length !== 2) 
                    if (repo.length > 2) throw new Error("There are two many things linked in the repository name!");
                    else throw new Error("There are two few things linked in the repository name!");

                debug.log("Got the repository sorted out!");

                var grabber = new Grabber(args.username, args.password);
                grabber.getIssues(repo[0], repo[1], function(results) {
                    debug.log("Got the results from the Grabber!");

                    if (results.HAS_ERROR) {

                        debug.error("There has been an error while grabbing the issues.", results.ERROR);

                    } else {

                        DEBUG.enable("result"); var printer = DEBUG("result");
                        printer("There are " + results.ALL + " issues in total on repository " + args.repository + " of which " + results.CLOSED + " are closed!");

                        var file = (require("node-uuid")).v1(),
                            fs   = require("fs");

                        debug.log("Computing data for a CSV export.");

                        var arr = results.getClosedTitles();
                        results.getClosedDates().map(function(item, index) {
                            arr[index] = (index + 1) + "," + arr[index] + "," + new Date(item).toLocaleString("en-GB");
                        });
                        arr.unshift("Number,Title,Date");

                        printer("Printing the titles and closed dates into a CSV file (" + file + ".csv) and a JSON for the other information (" + file + ".json).");
                        fs.writeFileSync(file + ".csv" , arr.join("\n"));
                        fs.writeFileSync(file + ".json", JSON.stringify({total: results.ALL, closed: results.CLOSED}));

                    }
                });
            } catch (e) {
                debug.error("There has been an error setting things up!", e.stack);
            }


        } else {

            debug.log("Accessing information by using an API");
            var Server = new (require("./server/http"))(host, port, args["api-only"]);

            if (args.compile !== null && typeof args.compile !== "undefined" && args.compile) Server.injectCompiler(new (require("./server/compiler"))());

            Server.start();
        }
    } else if (args.compile) {
        debug.log("The application will now compile the web application");

        var Compiler = new (require("./server/compiler"))();
        Compiler.compile();
        Compiler.compileStyles();

        debug.log("Finished compiling everything");
    } else {
        console.log("Instruction unknown! Please run the tool using --help to learn more.");
    }
})();