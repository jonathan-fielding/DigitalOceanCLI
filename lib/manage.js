//CLI module for managing droplets

//var Connection = require("./connection");
var inquirer = require("inquirer");
var getData = require("./getdata");
var q = require('q');

function Manage(id){
	this.dropletId = id;
}

Manage.prototype = {
	prompt: function(){
		getData.dropletById(this.dropletId).then(function(dropletData){
            
            //Get more data
            q.all([getData.regionById(dropletData.region_id),getData.sizeById(dropletData.size_id)]).then(function(data){
                var region = data[0];
                var size = data[1];
                var droplet = {
                    name: dropletData.name,
                    region: region.name,
                    size: size.name, 
                    ip: dropletData.ip_address
                };

                console.log(droplet);

                var actions = [
                    {
                        name: "action",
                        message: 'What do you want to manage?',
                        choices: ['reboot', 'power off', 'power on', 'password reset', 'resize', 'snapshot', 'restore', 'rebuild', 'enable backups', 'disable backups', 'rename', 'destroy'],
                        type: "list"
                    }
                ];

                inquirer.prompt(actions, function(selectedAction) {
                    console.log(selectedAction.action);
                });
            });
        });
	},
	reboot: function(){
		
	}
};

module.exports = Manage;