FROM britesnow/base-node

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

CMD ["/service/entry-point.sh"]