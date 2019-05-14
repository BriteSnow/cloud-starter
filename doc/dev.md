## Build

```sh
# build all of the services / docker images
npm run vdev dbuild

# build one service
npm run vdev dbuild web-server

# build more than one
npm run vdev dbuild web-server,agent
```

## Install, recreateDb

```sh
# install all kubernetes pods and start them
npm run vdev kcreate

# install the DB by going throw the agent service
npm run recreateDb
```

- Go to http://localhost:8080/ you should see the login / register page. 

## REPL Dev

`npm run watch` will rebuild and restart the server and what each service and compile and restart as appropriate: 
- When `web/ .js, .pcss, .tmpl` the approriate web source will be rebuilt and the app can just be reloaded in the browser. 
- When `services/agent/sql/*.sql` file changes, the `agent` service will be called to recreate the db. 
- When `services/web-server/**/*.ts` changes, they will be compile and the server will be restart (in debug mode, i.e., with `--inspect`) so that vscode can bind to it if needed. 

## REPL Test

```sh
# Run all of the test for a given service name (web-server)
npm run test web-server

# Run the test that contained "dao" (filter) for a given service name (web-server) (using mocha -g)
npm run test web-server dao

# Watch and run the tests as test file or source files for a given service get updated (support filter as well)
npm run testw web-server

# Watch and run the tests with the --inspect and --inspect-brk mode. Launch VSCode debug session to start test with. 
npm run testd web-server
```


## Debugging


When running a `npm run watch` the web-server will be started with the debug flag `--inspect` which allows to start a debug session. 


Look at the `.vscode/launch.json` `Attach to web-server` and starting it via vscode should allow to debug the web server. 


Note: For now, the debugging is for the web-server, and will be added to other services later. 
