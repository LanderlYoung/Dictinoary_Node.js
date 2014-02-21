#! /usr/bin/env node

/***************************************************************
  > File Name:     pnc.js
  > Author:        Landerl Young
  > Mail:          LanderlYoung@gmail.com 
  > Created Time:  Thu 20 Feb 2014 04:19:54 PM CST
 **************************************************************/

var http = require('http');
var fs = require('fs');
var spawn = require('child_process').spawn;

function makeTemp() {
	function genRandomString(length) {
		var str = "abcdefghijklmnopqrstuvwxyz" +
			"ABCDEFGHIJKLMNOPQRSTUVWXYZ" + 
			"0123456789";
		var res = '';
		for (var i =0; i < length; i++) {
			res += str[Math.floor(Math.random() * str.length)];
		}
		return res;
	}

	var count = 0;
	while (true) {
		//avoid dead loop
		if( count > 10) return null;

		var fileName = '/tmp/NodeDict.' + genRandomString(6) + '.mp3';
		try {
			var fd = fs.openSync(fileName, 'wx');
			//console.log('S file: ' + fileName );
			return { fileName : fileName, fd : fd };
		} catch (e) {
			//file alreadyExist
			//console.log(e);
		}
	}
}

function err_exit() {
	console.log('pronounce failed');
	process.exit(1);
}

function saveFile(data) {
	var file = makeTemp();
	if (!file) err_exit();
	fs.writeFileSync(file.fileName, data);
	fs.closeSync(file.fd);
	return file;
}

function playAndClean(file) {
	var play = spawn('play', [ file.fileName ]);
	play.on('exit', function (code, signal) {
		fs.unlinkSync(file.fileName);
	});
}

(function(){
	var argv = process.argv.splice(2);
	if ( argv.length < 1) err_exit();
	var queryURL = argv[0];

	var req = http.request(queryURL,  function(res) {
		var chunks = [], length = 0;
		res.on('data', function(trunk) {
			length += trunk.length;
			chunks.push(trunk);
		});
		res.on('end', function() {
			var data = new Buffer(length),
			pos = 0, 
			l = chunks.length;
		for (var i = 0; i < l; i++) {
			chunks[i].copy(data, pos);
			pos += chunks[i].length;
		}
		res.body = data;

		var fd = saveFile(data);
		playAndClean(fd);

		});
		res.on('error', function(err){
			//FIXME
			//console.log("requesr error");
		});
	});
	req.end();
})();
