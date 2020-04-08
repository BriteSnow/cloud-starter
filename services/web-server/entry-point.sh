npm start > ./service.log &

# Make sure the file get created before we to the tail -f
sleep 0.1s

tail -f ./service.log