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
`make run-dev`

## Test
`make test`

## Useful commands

### make npm
allow to run npm command in the docker npm
```
make npm install koa --save // will run `npm install koa --save` inside the npm docker
```sh
see [npm documentation](https://docs.npmjs.com/all)
