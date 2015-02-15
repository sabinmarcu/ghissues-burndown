(function(){
    var DEBUG  = require("debug");
    DEBUG.enable("app:*");
    var    debug  = {
            warning: DEBUG("app:warning:grabber"),
            error  : DEBUG("app:error:grabber"),
            log    : DEBUG("app:log:grabber")
        },
        _exists = function(item) { return item !== null && typeof item !== "undefined"; },
        _mixin  = function(){
            var args    = Array.prototype.slice.apply(arguments),
                base    = args[0],
                objects = args.splice(1);

            for (var index in objects) {    

                var object = objects[index];    
                if (_exists(object)) { 
                    for (var key in object) {
                        base[key] = object[key];
                    }  
                } else debug.warning("Attempting to mixin an invalid object!", object);
            } 

            return base;
        };    

    var stitch = require("stitchw"),
        stylus = require("stylus"),
        path   = require("path"),
        fs     = require("fs"),
        nib    = require("nib");

    var wrapFunction = {
        start: "(function(){" +
            "   'use strict';" +
            "   var getStylesheets = function() {" +
            "       var element;" +
            "       if (bundledStyles !== null && typeof(bundledStyles) !== 'undefined') {" +
            "           element = document.createElement('style');" +
            "           element.innerHTML = bundledStyles;" +
            "       } else {" +
            "           element = document.createElement('link');" +
            "           element.setAttribute('type', 'text/css');" +
            "           element.setAttribute('rel', 'stylesheet');" +
            "           element.setAttribute('href', '/css/#{json.name}.css');" +
            "       }" + 
            "       element.id = 'compiled_styles';" + 
            "       return element;" + 
            "   };",
        end: "" + 
            "   window.addEventListener('load', function() {" +
            "       new (require('Application'))(getStylesheets);" +
            "   }" +
            "})();",
        devMode: function() {
            if (DEBUG.enabled("app:log*")) return "window.isDev = true;";
            return "";
        }
    };

    var Compiler = function(cnf) {
        var opts = {
            compile: {},
            lifecycle: {}
        }, sources = [], config = JSON.parse(fs.readFileSync(path.resolve(__dirname + "/../config/sources.json"), "utf-8")), extras = [
            {
                type: "pre",
                generator: function() { return "window.AppInfo = " + fs.readFileSync(path.resolve(__dirname + "/../package.json")) + ";"; }   
            }
        ];

        if (_exists(cnf)) _mixin(config, cnf);

        var packages = {
            application: {
                config: config.packages.application,
                compiler: stitch.createPackage({
                    paths: (config.packages.application.paths || []).map(function(item){ return path.resolve(__dirname + "/../" + item); }),
                    dependencies: (config.packages.application.dependencies || []).map(function(item){ return path.resolve(__dirname + "/../" + item); }),
                })
            },
            stylesheets: {
                config: config.packages.stylesheets,
                compiler: {
                    base: path.resolve(__dirname + "/../" + config.packages.stylesheets.index),
                }
            }
        };

        var pass    = function(value) { return value; };
        var onError = function(error) {
            debug.error("Compile Error Encountered", error.stack);
            throw error;
        };

        var Runner = function(options, success, error) {
            var promise = new Promise(function(accept, reject){ accept(); });
            _mixin(opts.compile, config, options);
            return promise
                .then(compileStart)
                .then(compileSources)
                .then(compileStyles)
                .then(compileEnd)
                .then(cleanup)
                .then(success || pass)
                .catch(error || onError);
        };

        var StylesRunner = function(options, success, error) {
            var promise = new Promise(function(accept, reject){ accept(); });
            _mixin(opts.compile, config, options);
            return promise.then(function(){ return null; })
                .then(compileStyles)
                .then(success || pass)
                .catch(error || onError);
        };

        var compileStart   = function() {
            debug.log("MILESTONE", "Starting the Compile Lifecycle");
            extras.map(function(gen) {
                sources.push(gen);
            });
        };
        var compileSources = function() {
            return new Promise(function(accept, reject) {
                try {
                    debug.log("MILESTONE", "Compiling Sources");
                    if (packages.application.config != opts.compile.packages.application) {
                            debug.log("Creating new compiler for application (new options)");
                            packages.application.compiler = stitch.createPackage({
                                paths: (opts.compile.packages.application.paths || []).map(function(item){ return path.resolve(__dirname + "/../" + item); }),
                                dependencies: (opts.compile.packages.application.dependencies || []).map(function(item){ return path.resolve(__dirname + "/../" + item); }),
                            });
                            packages.application.config = opts.compile.packages.application;
                        }
                    packages.application.compiler.compile(function(err, source) {
                        if (_exists(err)) reject(err);
                        else accept(source);
                    });
                } catch (e) {
                    reject(e);
                }
            });
        };
        var compileStyles  = function(prev_source) {
            return new Promise(function(accept, reject){
                try {
                    debug.log("MILESTONE", "Compiling Styles"); 
                    if (packages.stylesheets.config != opts.compile.packages.stylesheets) {
                        debug.log("Creating new compiler for stylesheets (new options)");
                        packages.stylesheets.compiler.base =  path.resolve(__dirname + "/../" + opts.compile.packages.stylesheets.index);
                        packages.config = opts.compile.packages.stylesheets;
                    }
                    stylus(fs.readFileSync(packages.stylesheets.compiler.base, "utf-8"))
                        .set("filename", packages.stylesheets.compiler.base)
                        .set("paths", (packages.stylesheets.config.paths || []).map(function(item){ return path.resolve(__dirname + "/../" + item); }))
                        .use(nib())
                        .import("nib")
                        .render(function(err, css){
                            if (_exists(err)) reject(err);
                            else if (packages.stylesheets.config.bundle || _exists(process.args.bundle)) accept(prev_source + "\n" + css);
                            else {
                                writeFile(packages.stylesheets.config, css);
                                if (_exists(prev_source)) accept(prev_source);
                                else accept(css);
                            }
                        });
                } catch (e) {
                    reject(e);
                }
            });
        };
        var compileEnd = function(source) {
            debug.log("MILESTONE", "Ending the Compile Lifecycle");
            source = wrapFunction.start + source + wrapFunction.end;
            writeFile(packages.application.config, source);
            return source;
        };

        var cleanup = function(pass) {
            debug.log("MILESTONE", "Cleaning stuff out");
            extras.map(function(gen) {
                sources.pop();
            });
            return pass;
        };

        var writeFile = function(config, source) {
            if (config.write) {
                fs.writeFile(opts.compile.public.root + opts.compile.public[config.folder || "js"] + config.filename  || "index.js", source, "utf-8");
            }
        };

        return {
            compile: Runner,
            compileStyles: StylesRunner
        };
    };

    module.exports = Compiler;
})();