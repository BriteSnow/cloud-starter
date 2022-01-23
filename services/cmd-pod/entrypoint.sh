#!/bin/bash
npm start

# NOTE cmd-pod usually do not run start script for ever, 
#      so make sure the pod does not shutdown
tail -f /dev/null