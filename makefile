.PHONY: default install run-dev run-prod test npm

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := npm
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

install:
	docker-compose run npm install

run-dev:
	COMPOSE_FILE=development.yml docker-compose up --force-recreate server

run-prod:
	COMPOSE_FILE=production.yml docker-compose up --force-recreate server

test:
	COMPOSE_FILE=test.yml docker-compose run test

npm:
	docker-compose run --rm npm $(COMMAND_ARGS)
