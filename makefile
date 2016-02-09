.PHONY: default install run-dev run-prod test npm

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm restore-db _restore_db
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

bump:
	git rev-parse HEAD > .currentCommit

npm-install:
	docker-compose -f docker-compose.base.yml run npm install

install: npm-install bump

run-dev:
	NODE_ENV=development docker-compose up --force-recreate

run-prod:
	NODE_ENV=production docker-compose up -d --force-recreate

test:
	NODE_ENV=test docker-compose -f docker-compose.test.yml run node

stop:
	docker stop bibapi_server_1

npm:
	docker-compose -f docker-compose.base.yml run --rm npm $(COMMAND_ARGS)

connect-mongo:
	docker exec -it bibapi_mongo_1 mongo

add-user:
	NODE_ENV=production docker-compose run server node bin/addUser.js

add-admin:
	NODE_ENV=production docker-compose run server node bin/addAdminUser.js

save-db:
	docker exec -it bibapi_mongo_1 mongodump --db bibApi --out /backups/$(shell date +%Y_%m_%d_%H_%M)

restore-db:
ifdef COMMAND_ARGS
	@make _restore_db $(COMMAND_ARGS)
else
	echo 'please specify backup to restore':
	@ls -h ./backups
endif

_restore_db:
	docker exec -it bibapi_mongo_1 mongorestore --db bibApi /backups/$(COMMAND_ARGS)/bibApi
