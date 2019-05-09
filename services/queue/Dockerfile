FROM redis:4-alpine

EXPOSE 6379
ENTRYPOINT ["docker-entrypoint.sh"]

# The arg below is to avoid redis WARNING: The TCP backlog setting of 511 cannot be enforced because /proc/sys/net/core/somaxconn is set to the lower value of 128.
CMD ["redis-server", "--tcp-backlog", "128"]