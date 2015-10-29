# BibApi

## Installation
`make install`

### development
copy config/development.json.dist to config/development.json
and set the correct configuration value
then
`make run-dev`

### production
copy config/production.json.dist to config/production.json
and set the correct configuration value
then
`make run-prod`

## Test
`make test`

## Useful commands

### make stop
stop the server container, useful in production when it run detached.

### make npm
allow to run npm command in the docker npm
```
make npm install koa --save // will run `npm install koa --save` inside the npm docker
```sh
see [npm documentation](https://docs.npmjs.com/all)
