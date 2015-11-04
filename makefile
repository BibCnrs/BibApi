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
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --force-recreate server

run-prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate server

stop:
	docker stop bibapi_server_1

test:
	docker-compose -f docker-compose.yml -f docker-compose.test.yml run node

npm:
	docker-compose run --rm npm $(COMMAND_ARGS)
