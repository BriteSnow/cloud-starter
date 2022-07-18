FROM rust:1.58-slim-bullseye

RUN mkdir /service

WORKDIR /service

COPY ./entrypoint.sh /service/entrypoint.sh

# To make sure to have the same environments as as kexec (for ss3 for example)
ENTRYPOINT [ "/bin/bash", "-c", "source ~/.bashrc && /service/entrypoint.sh ${@}", "--" ]