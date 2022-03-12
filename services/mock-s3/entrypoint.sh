#!/bin/bash

# Start the minio server as background
minio server /data --console-address :9900 & disown

# Cheap way to wait the server is started (since we start it as background)
sleep 5s

# Create the minio alias pointing to this server
mc alias set minio http://localhost:9000 minio miniominio --api S3v4

# ----
# Seeding the buckets for dev and set them download (no sign in minio/dev environment)
# Prod will use aws s3 buckets
mc mb minio/core-bucket
mc policy set download minio/core-bucket

mc mb minio/logs-bucket
mc policy set download minio/logs-bucket


# wait forever
tail -f /dev/null