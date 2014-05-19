//CLI module for managing droplets

//var Connection = require("./connection");
var inquirer = require("inquirer");
var getData = require("./getdata");
var q = require('q');

function Manage(id){
    var done = false;
    var droplet = null;

    getData.dropletById(id).then(function(returnedDroplet){
        droplet = returnedDroplet;
        done = true;
    });

    while(!done) {
        require('deasync').runLoopOnce();
    }

    this.droplet = droplet;
}

var camelCase = function(input) { 
    var arr = input.split(/\s/),
        camel = arr[0];

    for (var i = 1; i < arr.length; i++) {
        camel += arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }

    return camel;
};

Manage.prototype = {
	prompt: function(){
        var dropletData = this.droplet;
        var that = this;
  
        //Get more data
        q.all([getData.regionById(dropletData.region_id),getData.sizeById(dropletData.size_id)]).then(function(data){
            var region = data[0];
            var size = data[1];

            console.log("Name: " + dropletData.name);
            console.log("Region: " + region.name);
            console.log("Size: " + size.name);
            console.log("IP Address: " + dropletData.ip_address);

            var actions = [
                {
                    name: "action",
                    message: 'What do you want to manage?',
                    choices: ['reboot', 'power off', 'power on', 'password reset', 'resize', 'snapshot', 'restore', 'rebuild', 'enable backups', 'disable backups', 'rename', 'destroy'],
                    type: "list"
                }
            ];

            inquirer.prompt(actions, function(selectedAction) {
                var action = camelCase(selectedAction.action);

                that[action]();
            });
        });
	},
	reboot: function(){
        var that = this;

		var questions = [
            {
                name: "rebootConfirmation",
                message: 'Are you sure you want to reboot?'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            if(answers.rebootConfirmation === "yes"){
                that.droplet.reboot();
            }
        });
	},
    powerOff: function(){
        console.log('not yet implemented');
    },
    powerOn: function(){
        console.log('not yet implemented');
    },
    passwordReset: function(){
        console.log('not yet implemented');
    },
    resize: function(){
        console.log('not yet implemented');
    },
    snapshot: function(){
        console.log('not yet implemented');
    },
    restore: function(){
        console.log('not yet implemented');
    },
    rebuild: function(){
        console.log('not yet implemented');
    },
    enableBackups: function(){
        console.log('not yet implemented');
    },
    disableBackups: function(){
        console.log('not yet implemented');
    },
    rename: function(){
        console.log('not yet implemented');
    },
    destroy: function(){
        console.log('not yet implemented');
    }
};

module.exports = Manage;