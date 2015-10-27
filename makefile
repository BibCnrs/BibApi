.PHONY: default install run test

install:
	docker-compose run install npm install

run:
	docker-compose up --force-recreate server 

test:
	docker-compose run test
