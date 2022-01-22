from minio/minio

# Setup the mc command
RUN curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && \
    chmod +x mc  && \
    mv mc /usr/bin/

COPY entrypoint.sh .

ENTRYPOINT /entrypoint.sh

# CMD ["server", "/data", "--console-address", ":9900"]