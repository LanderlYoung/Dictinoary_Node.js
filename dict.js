
var http = require('http');
var parse = require('url').parse;

function genUrl(word) {
    return 'http://dict.youdao.com/search?keyfrom=metrodict.main&xmlDetail=true&doctype=xml&xmlVersion=8.1&dogVersion=1.0&q=' + 
		parse(word).path +
		'&le=eng&keyfrom=metrodict.input&client=metrodict&id=3019615280104595010663601040404140109040186114402823410158212201782429070109&appVer=1.1.49.6663.beta&vendor=store';
}

// young test http request;
var word = "hello";//word to be queryed
var queryURL = genUrl(word);

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
        console.log(data.toString());
    });
    res.on('error', function(err){
        //FIXME
        console.log("requesr error");
    });
});
req.end();