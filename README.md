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
| 0.3 | Dealing with expiring grabbers | Open |
| 0.3 | Transfer this table into issues | Open |
| 0.4 | Setting up a public folder | Open |
| 0.4 | Building an interface | Open |
| 0.4 | Setting up the API consuming | Open |
| 0.4 | Test the GUI | Open | 
| 0.4 | Market and get collaborators / forks | Open |
| 0.5 | Set up a CLI binary | Open |
| 0.5 | Publish on NPM | Open | 
| 0.5 | Test NPM installations | Open |
| 0.5 | Hook NPM CLI to local repos (if possible) | Open | 
| 0.5 | Deploy application on Heroku / NodeJitsu | Open |
| pre 1.0 | Write up a good README | Open | 
| 1.0 | All of the above | Open |

## Usage 

1. If you have `Node.JS` installed, you're in luck! 
2. If you don't, head over to the `Node.JS` [download page](http://nodejs.org/download/) (or over to the `IO.JS` [download page](https://iojs.org/en/index.html) if you're feeling a bit more rebellious), download and install (or use something like `NVM` you're on [Bash and/or ZSH](https://github.com/creationix/nvm), or for [Fish](https://github.com/Alex7Kom/nvm-fish)).

From now on, I'll just assume you've installed `Node.JS` (or `IO.JS` if you're a bit of a hipster).

As you may have heard, the application can either be ran through the CLI to get just the information printed, and a CSV with the titles and close dates of the closed issues. It can also create an API that you can consume with your apps, or even run a webapp that consumes the API by itself. For now, the webapp is still under construction (see above table and issues);

#### Initialisation 

First things, first, after you've cloned the repository, just cd into the directory. Afterwards, you need to install the dependencies with `npm install` (`npm` is a tool that was installed with both IO and Node);

```
$ cd ghissues-burndown
$ **npm** *install*
```

The above will make sure all dependencies are installed, and the app is ready to go.

#### CLI

To use the cli, you must simply run a command like the following : 

```
$ node server **-r** *sabinmarcu/ghissues-burndown*
$ node server **--repository** *sabinmarcu/ghissues-burndown*
```

Both of the above instructions are equivalent. A full list of command line arguments is available as a help command (Note: currently not implemented. Give me a day or two) like so: 

```
$ node server **-h**
$ node server **--help**
```

At the same time, you can supply as arguments your github username and password (as of this time, no other authentication method is implemented): 

```
$ node server **-u** username **-P** password **-r** repository
$ node server **--user** username **--password** password **--repository** repository
```

Also, any command can be executed with the `-V` parameter to enable verbose mode and see exactly what's going on in there : 

```
$ node server **-V** **-r** repository
$ node server **-Vr** repository
$ node server **--verbose** **--repository** repository
```

#### API

To run the application in API mode (without the webapp), all you have to do is supply the `-a` argument (or `--api-only`): 

```
$ node server **-a**
$ node server **-Va** 
$ node server **--api-only**
$ node server **--api-only** **-v**
$ node server **--api-only** **--verbose**
```

When running the server (with or without the webapp) it is worth mentioning that you can alter the hostname and the port on which the server will run like so: 

```
$ node server **-H** hostname
$ node server **-p** port
$ node server **-H** hostname **-p** port
$ node server **--host** hostname
$ node server **--port** port
$ node server **--host** hostname **--port** port
```

## Have fun using this module. I know I will

#### `Blood for the Blood God!`, `Skulls for the Skull Throne!`