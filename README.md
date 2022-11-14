# BibApi

## Installation

`make install`

### development

- copy config/development.json.dist to config/development.json
- and set the correct configuration value
- then `make run-dev`

BibApi webserver is listening here: http://localhost:3000

To create an admin user:

```
make add-admin-dev
choose a username:admin
Enter the password:admin
```

To test the BibApi login route with this admin user:

```
curl -X POST -d '{ "username": "admin", "password":"admin"}' -H 'content-type:application/json' http://localhost:3000/admin/login
{"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ2.ayJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNDcwNDAwMzA4fQ.q3YbD8jGBQ9Kq3EPTlswQi8qKazfIPqn2A_-RugmEYw"}
```

### production

- copy config/production.json.dist to config/production.json
- and set the correct configuration value
- then `make run-prod`

## Test

`make test`

## Useful commands

### make stop

stop the server container, useful in production when it run detached.

### make npm

allow to run npm command in the docker npm

```sh
make npm install koa --save // will run `npm install koa --save` inside the npm docker
```

see [npm documentation](https://docs.npmjs.com/all)
