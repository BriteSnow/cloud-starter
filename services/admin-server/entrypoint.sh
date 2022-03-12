#!/bin/bash

# start the npm as a background
npm start &

# make this pid 1 run infinitely
tail -f /dev/null