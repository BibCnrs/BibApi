FROM node:6.7

MAINTAINER BibCNRS <bibcnrs@inist.fr>

ADD ./bin /app/bin
ADD ./config /app/config
ADD ./lib /app/lib
ADD ./launcher.js /app/launcher.js
ADD ./server.js /app/server.js
ADD ./server.js /app/server.js
ADD ./package.json /app/package.json
ADD ./migrat.config.js /app/migrat.config.js
ADD ./migrations /app/migrations

WORKDIR /app

RUN npm install --production

EXPOSE 3000

CMD node launcher.js
