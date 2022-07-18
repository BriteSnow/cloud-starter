#!/bin/bash

# NOTE 1 - Here, we make sure the service process starts inline (no background) inside the pid 1 process chain
#          This is very important to allow kubernetes to restart the pods on eventual crash or exits. 

# NOTE 2 - In the case of nodemon, the main process for the container is nodemon and not the managed node process. 
#          This allows faster restart during debug. 

# This mode is a normal run mode. When node process is killed or crash, kubernetes will restart the pod.
normal() {
  echo "run mode: NORMAL"
  npm start
}

# This does a npm run dstart (with --inspect), and similar to debug, . When node process is killed or crash, kubernetes will restart the pod.
debug_inspect() {
  echo "run mode: DEBUG_INSPECT"
  npm run dstart
}

# In this mode, we make nodemon ignore all src and dist files as we will trigger the restart manually
# by changing a /service/nodemon-restart.json (can be empty) from the scripts/cmd-watch.ts
debug_demon() {
  echo "run mode: DEBUG_DEMON"
  /service/node_modules/.bin/nodemon --ignore 'dist/*' --ignore 'test/*' --ignore 'src/*' dist/services/web-server/src/start
}

# Similar as above, but start the node with --inspect for breakpoint debug
debug_demon_inspect() {
  echo "run mode: DEBUG_DEMON_INSPECT"
  /service/node_modules/.bin/nodemon --inspect --ignore 'dist/*' --ignore 'test/*' --ignore 'src/*' dist/services/web-server/src/start
}

case "$RUN_MODE" in
        DEBUG_INSPECT) debug_inspect ;;
          DEBUG_DEMON) debug_demon ;;
  DEBUG_DEMON_INSPECT) debug_demon_inspect ;;
                    *) normal ;;

esac