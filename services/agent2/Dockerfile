FROM rust:1.53.0-slim-buster

RUN mkdir /service

WORKDIR /service

COPY ./entry-point.sh /service/entry-point.sh

CMD ["/service/entry-point.sh"]