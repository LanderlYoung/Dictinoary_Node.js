#! /usr/bin/env node
(function(){
	console.time("tag");
	for(i = 0; i < 1000; i++){
		Math.exp(i);
		Math.sqrt(i);
	}
	console.timeEnd("tag");

	console.dir(require("http"));
})();
