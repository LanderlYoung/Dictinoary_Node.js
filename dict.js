#! /usr/bin/env node

(function(){
	var http = require('http');
	var parse = require('url').parse;
	var xmlreader = require('xmlreader');
	var fs = require('fs');

	//flags
	var ee = false; //show english-english explination
	var ce = false; //show chinese-english explination
	var pnc = false; //pronounce

	//word to query
	var word = '';
	word = "can";

	ee = true;
	ce = true;

	function genUrl(word) {
		return 'http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=' + 
	parse(word).path +
	'&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=store';
	}

	// young test http request;
	var queryURL = genUrl(word);

	function show(output) {
		console.dir(output);
		return;

		var p = console.log;
		p(output.type);
		for(var i = 0; i < output.notes.length; i++) {
			var note = output.notes[i];
			p(note.type);
			note = note.note;
			for(var j = 0; j < note.length; j++ ) {
				p(note[j]);
			}
			p();
		}

	}

	function genOutput(xml) {
		var res = [];
		xmlreader.read(xml, function (err, response) {
			if (err) return console.log(err);

			var basic = response.yodaodict.basic;
			for (var i = 0; i < basic.count(); i++) {
				var expand = false;
				//english chinese --default
				var type = basic.at(i).type.text().toLowerCase();
				if ( type === 'ec' ||
					(type == 'ee' && ee) ||
					(type == 'ce' && ce)
				   ) {
					   res[res.length] = {
						   type : basic.at(i).name.text(), 
							claz : {
								type: '', exp : []
							},
					   };
					   expand = true;
				   }

				if (expand) {
					console.log(res[res.length - 1].type);
					//console.log(basic.at(i)['authoritative-dict'].word.trs);
					var claz = res[res.length - 1].claz;
					var trs = basic.at(i)['authoritative-dict'].word.trs;

					if(typeof trs === 'undefined') {
						console.dir( basic.at(i)['authoritative-dict'].word);
					}



					for(var t = 0; t < trs.count(); t++) {
						claz.type = trs.at(i).pos.text();
						var exp = claz.exp;
						var tr = trs.at(i).tr;

						for (var j = 0; j < tr.count(); j++) {
							//console.log(typeof tr.at(j).l);
							//	console.log(tr.at(j).l.i.text());
							exp.push(tr.at(j).l.i.text());
						}	
					}
				} else {
					//console.log(basic.at(i).name.text());
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
