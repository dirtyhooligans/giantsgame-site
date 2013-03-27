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

node-prod:
	-@killall node-dev
	-@killall node
	-@node_modules/forever/bin/forever stop app/ui/index.js
	@export NODE_ENV=production && node_modules/forever/bin/forever start app/ui/index.js

log:
	@touch logs/app.log
	@tail -f logs/app.log

dev: 
	@make node

prod:
	@make node-prod