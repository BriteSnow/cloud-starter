FROM britesnow/base-media:22-01-18

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

# To make sure to have the same environments as as kexec (for ss3 for example)
ENTRYPOINT [ "/bin/bash", "-c", "source ~/.bashrc && /service/entrypoint.sh ${@}", "--" ]