FROM britesnow/base-media:21-11-29

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

CMD ["/service/entry-point.sh"]