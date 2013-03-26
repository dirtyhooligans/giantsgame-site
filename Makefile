mongodb: 
	-@killall mongod
	@mongod

redis:
	-@killall redis-server
	-@killall redis
	@redis-server

node:
	-@killall node-dev
	-@killall node
	@NODE_DEV_IGNORE=./tmp ./node_modules/.bin/node-dev ./app/ui/index.js

log:
	@touch logs/app.log
	@tail -f logs/app.log

dev: 
	@make node