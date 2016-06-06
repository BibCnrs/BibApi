.PHONY: default install run-dev run-prod test npm help

.DEFAULT_GOAL := help

help:
	@test -f /usr/bin/xmlstarlet || echo "Needs: sudo apt-get install --yes xmlstarlet"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm restore-db-dev _restore_db_dev build
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

migration-dev:
	docker-compose -f docker-compose.dev.yml run server ./node_modules/migrat/bin/migrat up
migration-prod:
	docker-compose -f docker-compose.prod.yml run server ./node_modules/migrat/bin/migrat up
migration-test:
	docker-compose -f docker-compose.test.yml run server ./node_modules/migrat/bin/migrat up

bump: ## create .currentCommit file at the project root
	git rev-parse HEAD > .currentCommit

npm-install: ## run npm install
	docker-compose run npm install

install: npm-install bump  ## run npm install and bump

run-dev: ## run project in development mode
	docker-compose -f docker-compose.dev.yml up --force-recreate

run-prod: ## run project in production mode
	docker-compose -f docker-compose.prod.yml up -d --force-recreate

test: ## run test
	docker-compose -f docker-compose.test.yml run server

npm: ## allow to run dockerized npm command eg make npm 'install koa --save'
	docker-compose run --rm npm $(COMMAND_ARGS)

connect-mongo: ## connect to mongo
	docker exec -it bibapi_mongo_1 mongo

add-user: ## create user
	docker-compose run server node bin/addUser.js

add-admin-dev: ## create admin user
	docker-compose -f docker-compose.dev.yml run server node bin/addAdminUser.js

add-admin-prod: ## create admin user
	docker-compose -f docker-compose.prod.yml run server node bin/addAdminUser.js

save-db-dev: #save
	docker exec -it bibapi_postgres-dev_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD pg_dump --username $$POSTGRES_USER $$POSTGRES_DB > /backups/$(shell date +%Y_%m_%d_%H_%M_%S).sql'

restore-db-dev:  ## restore a given dump to the mongo database list all dump if none specified
ifdef COMMAND_ARGS
	@make _restore_db_dev $(COMMAND_ARGS)
else
	echo 'please specify backup to restore':
	@ls -h ./backups
endif

_restore_db_dev: save-db-dev
	docker exec -it bibapi_postgres-dev_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD dropdb --username $$POSTGRES_USER $$POSTGRES_DB' || true
	docker exec -it bibapi_postgres-dev_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD createdb --username $$POSTGRES_USER $$POSTGRES_DB' || true
	docker exec -it bibapi_postgres-dev_1 bash -c 'psql -f /backups/$(COMMAND_ARGS) postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:5432/$$POSTGRES_DB'

cleanup-docker: ## remove all bibapi docker image
	test -z "$$(docker ps -a | grep bibapi)" || \
            docker rm --force $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

stop: ## stop all bibapi docker image
	test -z "$$(docker ps | grep bibapi)" || \
            docker stop $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

build: ## args: <version> build bibcnrs/bibapi:<version> docker image default <version> to latest
ifdef COMMAND_ARGS
	docker build --no-cache --build-arg http_proxy --build-arg https_proxy -t 'vsregistry.intra.inist.fr:5000/bibapi:$(COMMAND_ARGS)' .
else
	docker build --no-cache --build-arg http_proxy --build-arg https_proxy -t 'vsregistry.intra.inist.fr:5000/bibapi:latest' .
endif

test-many-users:
	docker-compose -f docker-compose.test.yml run node node bin/testManyUser.js

connect-postgres-test:
	docker exec -it bibapi_postgres-test_1 psql -d bibapi-test -U postgres

connect-postgres-dev:
	docker exec -it bibapi_postgres-dev_1 psql -d bibapi-dev -U postgres

connect-postgres-prod:
	docker exec -it bibapi_postgres-prod_1 psql -d bibapi -U postgres
