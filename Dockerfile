FROM node:4.1.2

MAINTAINER BibCNRS <bibcnrs@inist.fr>

ADD . /app

WORKDIR /app

RUN npm install

EXPOSE 3000

CMD node launcher.js
