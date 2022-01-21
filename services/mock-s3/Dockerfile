from minio/minio

# Create the dev buckets
RUN mkdir /data && \
    mkdir /data/core-store-bucket && \
    mkdir /data/logs-bucket

CMD ["server", "/data", "--console-address", ":9900"]