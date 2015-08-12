//CLI module for managing droplets

//var Connection = require("./connection");
var inquirer = require("inquirer");
var getData = require("./getdata");
var q = require('q');
var exec = require('exec');

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
        var questions = [
            {
                name: "action",
                message: 'What would you like to do?',
                choices: [
                    {
                        value: 'ip',
                        name: 'Server IP'
                    }
                ],
                type: "list"
            }
        ];

        inquirer.prompt(questions, function( answers ) {
            if(answers.action === "ip") {
                console.log(this.droplet.networks.v4[0].ip_address);
            }
        }.bind(this));
	},
	reboot: function(){
        var that = this;

		var questions = [
            {
                name: "rebootConfirmation",
                message: 'Are you sure you want to reboot ' + that.droplet.name + '?',
                type: 'confirm'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            if(answers.rebootConfirmation){
                that.droplet.reboot();
            }
        });
	},
    powerOff: function(){
        var that = this;

        var questions = [
            {
                name: "powerOffConfirmation",
                message: 'Are you sure you want to power off ' + that.droplet.name + '?',
                type: 'confirm'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            if(answers.powerOffConfirmation){
                that.droplet.power_off();
            }
        });
    },
    powerOn: function(){
        var that = this;

        var questions = [
            {
                name: "powerOnConfirmation",
                message: 'Are you sure you want to power on ' + that.droplet.name + '?',
                type: 'confirm'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            if(answers.powerOnConfirmation){
                that.droplet.power_on();
            }
        });
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
        var that = this;

        var questions = [
            {
                name: "dropletName",
                message: 'What would you like to rename ' + that.droplet.name + ' to?'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            that.droplet.rename({name: answers.dropletName}, function(){
                console.log(that.droplet.name + "has been renamed to " + answers.dropletName);
            });
        });
    },
    destroy: function(){
        var that = this;

        var questions = [
            {
                name: "destroyConfirmation",
                message: 'Please type "DESTROY" to destroy the ' + that.droplet.name + ' droplet?'
            }
        ];

        inquirer.prompt(questions, function(answers) {
            if(answers.destroyConfirmation === "DESTROY"){
                that.droplet.destroy().on('error', function(error){ console.log(error);});
            }
        });
    }
};

module.exports = Manage;