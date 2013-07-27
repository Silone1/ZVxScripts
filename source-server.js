// This is not a pokemon online script

var http = require('http');

var sourced = http.createServer(giveSource);

sourced.listen(5081);