.PHONY: default install run-dev run-prod test npm help

.DEFAULT_GOAL := help

help:
	@test -f /usr/bin/xmlstarlet || echo "Needs: sudo apt-get install --yes xmlstarlet"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm restore-db _restore_db build
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

bump: ## create .currentCommit file at the project root
	git rev-parse HEAD > .currentCommit

npm-install: ## run npm install
	docker-compose -f docker-compose.yml run npm install

install: npm-install bump  ## run npm install and bump

run-dev: ## run project in development mode
	docker-compose -f docker-compose.dev.yml up --force-recreate

run-prod: ## run project in production mode
	docker-compose -f docker-compose.prod.yml up -d --force-recreate

test: ## run test
	docker-compose -f docker-compose.test.yml run node

npm: ## allow to run dockerized npm command eg make npm 'install koa --save'
	docker-compose -f docker-compose.base.yml run --rm npm $(COMMAND_ARGS)

connect-mongo: ## connect to mongo
	docker exec -it bibapi_mongo_1 mongo

add-user: ## create user
	NODE_ENV=production docker-compose run server node bin/addUser.js

add-admin: ## create admin user
	NODE_ENV=production docker-compose run server node bin/addAdminUser.js

save-db: ## create a dump of the mongo database arg: <name> default to current date
	docker exec -it bibapi_mongo_1 mongodump --db bibApi --out /backups/$(shell date +%Y_%m_%d_%H_%M)

restore-db:  ## restore a given dump to the mongo database list all dump if none specified
ifdef COMMAND_ARGS
	@make _restore_db $(COMMAND_ARGS)
else
	echo 'please specify backup to restore':
	@ls -h ./backups
endif

_restore_db:
	docker exec -it bibapi_mongo_1 mongorestore --db bibApi /backups/$(COMMAND_ARGS)/bibApi

cleanup-docker: ## remove all bibapi docker image
	test -z "$$(docker ps -a | grep bibapi)" || \
            docker rm --force $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

stop: ## stop all bibapi docker image
	test -z "$$(docker ps | grep bibapi)" || \
            docker stop $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

build: ## args: <version> build bibcnrs/bibapi:<version> docker image default <version> to latest
ifdef COMMAND_ARGS
	docker build --build-arg http_proxy --build-arg https_proxy -t bibcnrs/bibapi:$(COMMAND_ARGS) .
else
	docker build --build-arg http_proxy --build-arg https_proxy -t bibcnrs/bibapi:latest .
endif
