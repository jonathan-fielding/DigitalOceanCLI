var DigitalOcean = require('do-wrapper');
var inquirer = require("inquirer");
var fs = require('fs');
var USERHOME = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];


var parseApiKeys = function(){
    var data = null;

    if (fs.existsSync(USERHOME + "/.digitalocean.json")) {
        data = fs.readFileSync(USERHOME + "/.digitalocean.json", "utf-8");
        return JSON.parse(data);
    }
    else{
        return false;
    }
};

var setupApiKeys = function(){
	var keys = {};
	var done = false;

	var questions = [
        {
            name: "apiKey",
            message: 'Digital Ocean API KEY?'
        }
    ];

	inquirer.prompt(questions, function( answers ) {
        fs.writeFileSync(USERHOME + "/.digitalocean.json", JSON.stringify(answers));
        
        keys = answers;
        done = true;
    });

    while(!done) {
		require('deasync').runLoopOnce();
	}


    return keys;
};

var Connection = function(){
	var keys = parseApiKeys();

	if(!keys){
		keys = setupApiKeys();
	}

	return new DigitalOcean(keys.apiKey, 10);
};

module.exports = new Connection();