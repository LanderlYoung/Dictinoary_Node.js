#! /usr/bin/env node

/***************************************************************
    > File Name:     dict.js 
    > Author:        Landerl Young
    > Mail:          LanderlYoung@gmail.com 
    > Created Time:  Tus 18 Feb 2014 06:04:06 PM CST
 **************************************************************/


var http = require('http');
var xmlreader = require('xmlreader');
var fs = require('fs');

//flags
var ee = false; //show english explination
var cc = true; //show chinese explination
var pnc = false; //pronounce
//word to query
var word = '';

//command line arguments
var argv = process.argv.splice(2);

(function(){
	if (argv.length == 0 || argv.length > 2) {
		usage();
		process.exit(1);
	} else if( argv.length == 1) {
		word = argv[0];
	} else {
		var swt = argv[0];
		word = argv[1];
		if( swt.search(/e|E/) != -1) {
			ee = true;
		}
		if( swt.search(/p|P/) != -1) {
			pnc = true;
		}
		if( swt.search(/v/) != -1) {
			ee = cc = true;
		}
		if(swt.search(/V/) != -1) {
			pnc = true;
			ee = cc = true;
		}
	}
})();

function usage() {
	console.log("dict [epvV] <word>\n" + 
			"    e - show english explanation\n" +
			"    p - prononuce (not available now)\n" +
			"    v - verbose -- show as much explanation as possible.\n" +
			"    V - same as vp"
			);

}

function genUrl(word) {
	return 'http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=' + 
		encodeURI(word) + 
		'&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=store';
}

// young test http request;
var queryURL = genUrl(word);

function show(output) {
	var p = console.log;

	RED = "\033[1;31m";
	GREEN = "\033[1;32m";
	DEFAULT = "\033[0;49m";

	BOLD = "\033[1m";
	UNDERLINE = "\033[4m";
	NORMAL = "\033[m";

	p(UNDERLINE + word + NORMAL);
	p();

	for (var basic_c = 0; basic_c < output.length; basic_c++) {
		//type
		p(UNDERLINE + RED + output[basic_c].type + NORMAL);
		var xword = output[basic_c].word;
		for(var word_c = 0; word_c < xword.length; word_c++) {
			try {
				//word
				var trs = xword[word_c].trs;
				//		console.dir(trs);

				for (var trs_c = 0; trs_c < trs.length; trs_c++) {
					//type
					p('  ' + GREEN + BOLD + trs[trs_c].type + NORMAL);
					var exp = trs[trs_c].exp;

					for (var exp_c = 0; exp_c < exp.length; exp_c++) {
						p('    ' + exp[exp_c]);
					}
				}
			} catch (e) {}

		}
		p();
	}
}

function genOutput(xml) {
	var res = [];
	xmlreader.read(xml, function (err, response) {
		if (err) return console.log(err);

		var basic = response.yodaodict.basic;

		if(!basic) return;

		for (var i = 0; i < basic.count(); i++) {
			var expand = false;
			//english chinese --default
			var type = basic.at(i).type.text().toLowerCase();
			if ( (type === 'ec' && cc) ||
				(type === 'ee' && ee) ||
				(type === 'ce' && cc) ) {
					res.push({
						type : basic.at(i).name.text(), 
						word : []
					});
					expand = true;
				}

			if (expand) {
				//console.log(res[res.length - 1].type);
				var xword = basic.at(i)['authoritative-dict'].word;

				if (!xword) continue;

				var word = res[res.length - 1].word;
				for( var word_c = 0; word_c < xword.count(); word_c++) {
					word.push( { type : '', trs : []});

					var xtrs = xword.at(word_c).trs;

					if (!xtrs) continue;

					var trs = word[word.length -1].trs;
					trs.push({type : '', exp : []});
					var exp = trs[trs.length - 1].exp;
					for(var trs_c = 0; trs_c < xtrs.count(); trs_c++) {
						if( xtrs.at(trs_c).pos ) {
							trs[trs.length -1].type = xtrs.at(trs_c).pos.text();
						}
						var xtr = xtrs.at(trs_c).tr;

						if (!xtr) continue;

						for( var tr_c = 0; tr_c < xtr.count(); tr_c++) {
							try {
								exp.push(xtr.at(tr_c).l.i.text());
							} catch (e) {
							}
						}
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
