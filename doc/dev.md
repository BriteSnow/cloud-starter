_[home](../README.md)_

# Development

## Build

```sh
# build all of the services / docker images
kdd dbuild

# build one service
kdd dbuild web-server

# build more than one
kdd dbuild web-server,cmd-pod
```

## Install, recreateDb

```sh
# install all kubernetes pods and start them
kdd kapply

# install the DB by going throw the cmd-pod service
npm run recreateDb
```

- Go to http://localhost:8080/ you should see the login / register page. 

## REPL Dev

`npm run watch` will rebuild and restart the server and what each service and compile and restart as appropriate: 
- When `web/ .js, .pcss, .tmpl` the approriate web source will be rebuilt and the app can just be reloaded in the browser. 
- When `services/cmd-pod/sql/*.sql` file changes, the `cmd-pod` service will be called to recreate the db. 
- When `services/web-server/**/*.ts` changes, they will be compile and the server will be restart (in debug mode, i.e., with `--inspect`) so that vscode can bind to it if needed. 

## REPL Test

```sh
# Watch the service
npm run watch

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


## Useful kubectl commands

Connect to the various service/pods

```sh
kubectl exec -it $(kubectl get pods -l run=cstar-cmd-pod --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash

kubectl exec -it $(kubectl get pods -l run=cstar-web-server --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash

kubectl exec -it $(kubectl get pods -l run=cstar-vid-init --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash

kubectl exec -it $(kubectl get pods -l run=cstar-vid-scaler --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash
```

Connect to db for psql

```sh
kubectl exec -it $(kubectl get pods -l run=cstar-db --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash

# and then,
psql -U postgres

## And in sql
psql$ \c cstar_db
```

Connect to mock-s3 (minio)

```sh
kubectl exec -it $(kubectl get pods -l run=cstar-mock-s3 --no-headers=true -o custom-columns=:metadata.name) -- /bin/bash

```