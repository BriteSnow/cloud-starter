#!/bin/bash

# NOTE - Here, we make sure the process started is inlined (no background) so that if it fails
#        this process will exit, which will exit, ending PID 1, terminating the pod, which will make 
#        kubernetes restart the pod. This will make the overall system much more resilient.

function normal() {
  echo "run normal mode"
  npm start
}

function debug() {
  echo "run debug mode"
  nohup npm run dstart
}

case "$RUN_MODE" in
  DEBUG) debug ;;
      *) normal ;;
esac