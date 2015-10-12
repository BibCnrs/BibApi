.PHONY: default install run test

install:
	docker-compose run install npm install

run:
	docker-compose up server

test:
	docker-compose run test
