FROM britesnow/base-node:20-07-29

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

CMD ["/service/entry-point.sh"]