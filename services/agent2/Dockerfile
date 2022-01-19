FROM rust:1.58-slim-bullseye

RUN mkdir /service

WORKDIR /service

COPY ./entry-point.sh /service/entry-point.sh

CMD ["/service/entry-point.sh"]