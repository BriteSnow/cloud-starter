#!/bin/bash

# NOTE - we source /root/.profile to make sure it is run when kubectl exec
source /root/.profile

# NOTE - all output are piped to PID 1 (/proc/1/fd/1) 
#        to allow docker/kuberentes to use kubectly log ...

## Ending the npm (probably can 'pkill npm')
echo "Killing npm $(pgrep npm)" >> /proc/1/fd/1
kill -9 $(pgrep npm)
sleep .1

## Ending the npm (probably can 'pkill npm')
echo "Killing node $(pgrep node)" >> /proc/1/fd/1
kill -9 $(pgrep node)
sleep .3

## Restart server in debug mode
echo "Running 'npm run dstart'" >> /proc/1/fd/1
nohup npm run dstart >> /proc/1/fd/1 &

