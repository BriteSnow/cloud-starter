#!/bin/bash

# NOTE 1 - This is command pod and is designed to be kubectl exec, 
#          and therefore should run infinitely

# NOTE 2 - When kubectl exec /bin/bash to it and running a script, it's a good diea to 
#          output to pid 1 with '>> /proc/1/fd/1' so that the output can be accessible via `kubectl logs ...`
#          for example `npm run dropFiles >> /proc/1/fd/1`

# for the command pod, make the pid 1 run infinitely
tail -f /dev/null