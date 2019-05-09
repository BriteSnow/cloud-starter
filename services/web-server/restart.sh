#!/bin/ash
echo "Killing npm $(pgrep npm)"
# probably can use 'pkill npm' as well
kill -9 $(pgrep npm)
sleep .1
echo "Killing node $(pgrep node)"
kill -9 $(pgrep node)
sleep .3
echo "Running npm start.."
nohup npm run dstart >> ./service.log 2>>./service.log 0</dev/null & 
sleep 2 
echo "done restart"