.PHONY: default install run-dev run-prod test npm help

.DEFAULT_GOAL := help

help:
	@test -f /usr/bin/xmlstarlet || echo "Needs: sudo apt-get install --yes xmlstarlet"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm restore-db-dev _restore_db_dev restore-db-prod _restore_db_prod build import_units import_users import_sections import_unit_sections create-test-alert
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

migration-dev: ## execute postgres migration for bibapi-dev database
	docker compose -f docker-compose.dev.yml run --rm server ./node_modules/migrat/bin/migrat up
migration-dev-unix: ## execute postgres migration for bibapi-dev database
	docker compose -f docker-compose.dev.unix.yml run --rm server ./node_modules/migrat/bin/migrat up
migration-prod: ## execute postgres migration for bibapi-prod database
	docker compose -f docker-compose.prod.yml run --rm server ./node_modules/migrat/bin/migrat up
migration-test: ## execute postgres migration for bibapi-test database
	docker compose -f docker-compose.test.yml run --rm server ./node_modules/migrat/bin/migrat up

bump: ## create .currentCommit file at the project root
	git rev-parse HEAD > .currentCommit

npm-install: ## run npm install
	docker compose -f docker-compose.dev.yml run --rm bibcnrs-api-dev-npm ci

install: npm-install bump  ## run npm install and bump

cleanup-dev-docker: ## remove all bibcnrs-api docker image
	test -z "$$(docker ps -a | grep bibcnrs-dev-api)" || \
            docker rm --force $$(docker ps -a | grep bibcnrs-dev-api | awk '{ print $$1 }')

run-dev: ## run project in development mode
	make cleanup-dev-docker
	docker compose -f docker-compose.dev.yml up --force-recreate

test: test-network install test-run

test-network:
	docker network create -d bridge bib-backend-network
	docker network create -d bridge bib-frontend-network

test-run: ## run test
	docker compose -f docker-compose.test.yml run --rm server

npm: ## allow to run dockerized npm command eg make npm 'install koa --save'
	docker compose run --rm npm $(COMMAND_ARGS)

add-admin-dev: ## create admin user
	docker compose -f docker-compose.dev.yml run --rm server node bin/addAdminUser.js

add-admin-dev-unix: ## create admin user
	docker compose -f docker-compose.dev.unix.yml run --rm server node bin/addAdminUser.js

add-admin-prod: ## create admin user
	docker compose -f docker-compose.prod.yml run --rm server node bin/addAdminUser.js

save-db-dev: ## create postgres dump for prod database in backups directory with given name or default to current date
	docker exec bibcnrs-dev-api-postgres bash -c 'PGPASSWORD=secret pg_dump --username postgres bibapi-dev > /backups/$(shell date +%Y_%m_%d_%H_%M_%S).sql'

restore-db-dev:  ## restore a given dump to the postgres database list all dump if none specified
ifdef COMMAND_ARGS
	@make _restore_db_dev $(COMMAND_ARGS)
else
	echo 'please specify backup to restore':
	@ls -h ./backups
endif

_restore_db_dev:
	docker exec bibcnrs-dev-api-postgres bash -c 'PGPASSWORD=secret dropdb --username postgres bibapi-dev'
	docker exec bibcnrs-dev-api-postgres bash -c 'PGPASSWORD=secret createdb --username postgres bibapi-dev' || true
	docker exec bibcnrs-dev-api-postgres bash -c 'ls && psql -f /backups/$(COMMAND_ARGS) postgres://postgres:secret@bibcnrs-dev-api-postgres:5432/bibapi-dev'

save-db-prod: ## create postgres dump for prod database in backups directory with given name or default to current date
	docker exec bibapi_postgres-prod_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD pg_dump --username $$POSTGRES_USER $$POSTGRES_DB > /backups/$(shell date +%Y_%m_%d_%H_%M_%S).sql'

restore-db-prod:  ## restore a given dump to the postgres database list all dump if none specified
ifdef COMMAND_ARGS
	@make _restore_db_prod $(COMMAND_ARGS)
else
	echo 'please specify backup to restore':
	@ls -h ./backups
endif

_restore_db_prod: save-db-prod
	docker exec bibapi_postgres-prod_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD dropdb --username $$POSTGRES_USER $$POSTGRES_DB'
	docker exec bibapi_postgres-prod_1 bash -c 'PGPASSWORD=$$POSTGRES_PASSWORD createdb --username $$POSTGRES_USER $$POSTGRES_DB' || true
	docker exec bibapi_postgres-prod_1 bash -c 'psql -f /backups/$(COMMAND_ARGS) postgres://$$POSTGRES_USER:$$POSTGRES_PASSWORD@$$POSTGRES_HOST:5432/$$POSTGRES_DB'

cleanup-docker: ## remove all bibapi docker image
	test -z "$$(docker ps -a | grep bibapi)" || \
            docker rm --force $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

stop: ## stop all bibapi docker image
	test -z "$$(docker ps | grep bibapi)" || \
            docker stop $$(docker ps -a | grep bibapi | awk '{ print $$1 }')

build: ## args: <version> build bibcnrs/api:<version> docker image default <version> to latest
ifdef COMMAND_ARGS
	docker build --no-cache --build-arg http_proxy --build-arg https_proxy -t 'vxnexus-registry.intra.inist.fr:8083/bibcnrs/api:$(COMMAND_ARGS)' .
else
	docker build --no-cache --build-arg http_proxy --build-arg https_proxy -t 'vxnexus-registry.intra.inist.fr:8083/bibcnrs/api:latest' .
endif

update: stop cleanup-docker install build

connect-postgres-test: ## connect to postgres for test environment
	docker exec -it bibapi_postgres-test_1 psql -d bibapi-test -U postgres

connect-postgres-dev: ## connect to postgres for dev environment
	docker exec -it bibapi_postgres-dev_1 psql -d bibapi-dev -U postgres

connect-postgres-prod: ## connect to postgres for prod environment
	docker exec -it bibapi_postgres-prod_1 psql -d bibapi-prod -U postgres

import_units: ## args: <file> import units from given csv <file> will update existiong units with same code
	docker exec -it bibapi-srv node ./bin/parseFedeAdminUnitsCSV.js $(COMMAND_ARGS)

import_users: ## args: <file> import units from given csv <file> will update existiong units with same code
	docker exec -it bibapi-srv node ./bin/parseFedeAdminUsersCSV.js $(COMMAND_ARGS)

clear_history: ## Clear search history entries older than 2 months
	docker exec bibapi-srv node ./bin/cleanOldHistoryEntries.js

import_sections: ## args: <file> import units from given csv <file> will update existiong units with same code
	docker exec -it bibapi-srv node ./bin/importSectionCN.js $(COMMAND_ARGS)

import_unit_sections: ## args: <file> import units from given csv <file> will update existiong units with same code
	docker exec -it bibapi-srv node ./bin/assignSectionToUnit.js $(COMMAND_ARGS)

search_alert_dev: ## search alert cron command
	docker exec bibcnrs-dev-api node bin/searchAlert.js

search_alert: ## search alert cron command
	docker exec bibapi-srv node bin/searchAlert.js

create-test-alert: ## args: <user uid> create alert for every search in <user> history
	docker exec -it bibcnrs-dev-api node bin/createAlertForTest.js $(COMMAND_ARGS)

prisma-generate: ## generate prisma client
	docker exec -it bibcnrs-dev-api npx prisma generate

mocha: ## run mocha tests
	docker exec -it bibapi-srv npm run test