FROM britesnow/base-agent:20-08-14

RUN mkdir /service

WORKDIR /service

COPY package.json ./
RUN npm install
COPY . .

CMD ["/service/entry-point.sh"]