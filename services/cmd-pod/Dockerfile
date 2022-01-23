FROM britesnow/base-agent:22-01-18

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

ENTRYPOINT [ "/bin/bash", "-c", "source ~/.bashrc && /service/entrypoint.sh ${@}", "--" ]