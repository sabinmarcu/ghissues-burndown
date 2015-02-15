# GitHub Issues – Burndown Charts

This project (when complete) will allow any user to run a small, simple app that pulls all issues from GitHub, and plots out a burndown chart.

## Done so far (will be mirrored in issues)

| Version | Description | Status |
|:---|:---|:---:|
| 0.1 | Implement Grabbers | Done |
| 0.1 | Implement a basic Server | Done |
| 0.1 | Implement a CLI | Done |
| 0.2 | Implement using and exporting from CLI | Done |
| 0.2 | Test out Grabbers on CLI | Done | 
| 0.3 | Setting up a server | Done |
| 0.3 | Setting up an API | Done | 
| 0.3 | Testing the API | Done | 
| 0.3 | Dealing with expiring grabbers | In Progress |
| 0.3 | Transfer this table into issues | In Progress |
| 0.4 | Setting up a public folder | In Progress |
| 0.4 | Building an interface | Not Started |
| 0.4 | Setting up the API consuming | Not Started |
| 0.4 | Test the GUI | Not Started | 
| 0.4 | Market and get collaborators / forks | Not Started |
| 0.5 | Set up a CLI binary | Not Started |
| 0.5 | Publish on NPM | Not Started | 
| 0.5 | Test NPM installations | Not Started |
| 0.5 | Hook NPM CLI to local repos (if possible) | Not Started | 
| 0.5 | Deploy application on Heroku / NodeJitsu | Not Started |
| pre 1.0 | Write up a good README | Not Started | 
| 1.0 | All of the above | Not Started |

## Usage 

1. If you have `Node.JS` installed, you're in luck! 
2. If you don't, head over to the `Node.JS` [download page](http://nodejs.org/download/) (or over to the `IO.JS` [download page](https://iojs.org/en/index.html) if you're feeling a bit more rebellious), download and install (or use something like `NVM` you're on [Bash and/or ZSH](https://github.com/creationix/nvm), or for [Fish](https://github.com/Alex7Kom/nvm-fish)).

From now on, I'll just assume you've installed `Node.JS` (or `IO.JS` if you're a bit of a hipster).

As you may have heard, the application can either be ran through the CLI to get just the information printed, and a CSV with the titles and close dates of the closed issues. It can also create an API that you can consume with your apps, or even run a webapp that consumes the API by itself. For now, the webapp is still under construction (see above table and issues);

#### Initialisation 

First things, first, after you've cloned the repository, just cd into the directory. Afterwards, you need to install the dependencies with `npm install` (`npm` is a tool that was installed with both IO and Node);

```bash
$ cd ghissues-burndown
$ npm install
```

The above will make sure all dependencies are installed, and the app is ready to go.

#### CLI

To use the cli, you must simply run a command like the following : 

```bash
$ node server -r sabinmarcu/ghissues-burndown
$ node server --repository sabinmarcu/ghissues-burndown
```

Both of the above instructions are equivalent. A full list of command line arguments is available as a help command (Note: currently not implemented. Give me a day or two) like so: 

```bash
$ node server -h
$ node server --help
```

At the same time, you can supply as arguments your github username and password (as of this time, no other authentication method is implemented): 

```bash
$ node server -u username -P password -r repository
$ node server --user username --password password --repository repository
```

Also, any command can be executed with the `-V` parameter to enable verbose mode and see exactly what's going on in there : 

```bash
$ node server -V -r repository
$ node server -Vr repository
$ node server --verbose --repository repository
```

#### Web Server

To run a web server (for API and/or Web Application), you must supply the `-s` argument (or `--server`). This will launch an express server with either `0.0.0.0` as address and `8000` port by default.

```bash
$ node server -s
$ node server --server
```

#### API

To run the application in API mode (without the webapp), all you have to do is supply the `-a` argument (or `--api-only`): 

```bash
$ node server -sa
$ node server -Vsa 
$ node server -s --api-only
$ node server --server --api-only -v
$ node server --server --api-only --verbose
```

When running the server (with or without the webapp) it is worth mentioning that you can alter the hostname and the port on which the server will run like so: 

```bash
$ node server -sH hostname
$ node server -sp port
$ node server -sH hostname -p port
$ node server --server --host hostname
$ node server --server --port port
$ node server --server --host hostname --port port

#### Web Application

To run the application with the web application, simply run it as you would in API mode, but without specifying the `-a` parameter.

```bash
$ node server -s 
$ node server --server 
```

However, if you wish to work on the web application (develop), then it is worth mentioning dynamic content compiling, which will generate a new version of the content on each request. This is done with the `-c` parameter, just as compiling.

```bash
$ node server -sc 
$ node server -c --server 
$ node server -s --compile 
$ node server --server --compile
```

At the same time, the compiler will take into accout the use (or lack of use) of the **bundle** argument (see @ Compiling the Web Application, aka next paragraph) by using the `-b` argument (or `--bundle`) as such : 

```bash
$ node server -scb 
$ node server -c --server --bundle
$ node server -s --compile --bundle
$ node server -b --server --compile
```


#### Compiling the Web Application

The web application can be compiled without the need for a server. The environment is set up by default to not bundle the sources, and write them in the specified folders and filenames. This default configuration can be found in the `config/sources.json` file. I recommend looking over it at least once.

Now, to compile the application, all you must do is use the `-c` (or `--compile`) argument while running the tool. 

```bash
$ node server -c
$ node server --compile
```

However, if you want to build for production and overwrite any bundle configurations (bundle everything), then just supply the `-b` argument (or `--bundle`).

```bash
$ node server -cb
$ node server -c --bundle
$ node server -b --compile
$ node server --bundle --compile
```

## Have fun using this module. I know I will

`Blood for the Blood God!`, `Skulls for the Skull Throne!`, `Death to the False Emperor!`
