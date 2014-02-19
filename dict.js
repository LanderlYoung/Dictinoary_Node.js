#! /usr/bin/env node

(function(){
	var http = require('http');
	var parse = require('url').parse;
	var xmlreader = require('xmlreader');
	var fs = require('fs');

	//flags
	var eng = false; //show english-english explination
	var han = false; //show chinese-english explination
	var pnc = false; //pronounce

	function genUrl(word) {
		return 'http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=' + 
	parse(word).path +
	'&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=store';
	}

	// young test http request;
	var word = "node"; //word to be queryed
	var queryURL = genUrl(word);

	function show(output) {
		var p = console.log;
		p(output.type);
		for(var i = 0; i < output.notes.length; i++) {
			var note = output.notes[i];
			p(note.type);
			note = note.note;
			for(var j = 0; j < note.length; j++ ) {
				p(note[j]);
			}
		}
	}

	function genOutput(xml) {
		var res = { type : '', notes : [] };
		xmlreader.read(xml, function (err, response) {
			if (err) return console.log(err);

			var basic = response.yodaodict.basic;
			for (var i = 0; i < basic.count(); i++) {
				if (basic.at(i).name.text() === "英汉翻译") {
					res.notes[res.notes.length] = { type : "英汉翻译", 
						note : []
					};
					//console.log(basic.at(i)['authoritative-dict'].word.trs);
					var note = res.notes[res.notes.length - 1].note;
					var tr = basic.at(i)['authoritative-dict'].word.trs.tr;
					for (var j = 0; j < tr.count(); j++) {
						//console.log(typeof tr.at(j).l);
					//	console.log(tr.at(j).l.i.text());
						note[note.length] = tr.at(j).l.i.text();
					}	
				} else {
					console.log(basic.at(i).name.text());
				}
			}

		});
		return res;
	}

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
		//TODO
		//console.log(data.toString());
		var output = genOutput(data.toString());
		show(output);

		});
		res.on('error', function(err){
			//FIXME
			console.log("requesr error");
		});
	});
	req.end();
}());
