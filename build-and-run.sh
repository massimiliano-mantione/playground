./node_modules/.bin/mjs server.mjs -sm && ./node_modules/.bin/mjs client.mjs -sm && browserify client.js -o bundle.js -d && node server.js
