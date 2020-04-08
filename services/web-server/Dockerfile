FROM britesnow/base-node-buster

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

CMD ["/service/entry-point.sh"]