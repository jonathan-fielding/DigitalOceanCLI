#! /usr/bin/env node
/*
 * DigitalOceanCLI
 * https://github.com/jonathan-fielding/DigitalOceanCLI
 *
 * Copyright (c) 2014 Jonathan Fielding
 * Licensed under the MIT license.
 */

'use strict';

//External Modules
var program = require('commander');
var pjson = require('../package.json');
var q = require('q');
var inquirer = require("inquirer");
var fs = require('fs');
var _ = require('lodash');

//Connection to the API
var Connection = require("./connection");

//Droplet management constructor
var ManageDroplet = require("./manage");

//Module to handle creating new droplets
//var NewDroplet = require("./new");

//Module to simply get data from the API
var ApiData = require("./getdata");

var cli = (function(){
    var USERHOME = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

    var putData = {
        sshAdd: function(data){
            var deferred = q.defer();

            Connection.ssh_keys.new(data, function(returnData){
                deferred.resolve(returnData);
            });

            return deferred.promise;
        }
    };

    var parseApiData = function(data){
        for (var i = data.length - 1; i >= 0; i--) {
            data[i].value = data[i].id;
        }

        return data;
    };

    var parseApiSizes = function(data){
        for (var i = data.length - 1; i >= 0; i--) {
            data[i].value = data[i].slug;
            data[i].name = data[i].slug + ' mem, ' + data[i].disk + ' disk ' + data[i].vcpus + ' vcpus - $' + data[i].price_monthly + 'p/m';
        }

        return data;
    };

    var parseFileList = function(data){
        var arr = [];

        for (var i = 0; i < data.length; i++) {
            if(data[i].match(/([A-Za-z_])+(.pub)/g)){
                arr.push(data[i]);
            }
        }

        return arr;
    };

    var findData = function(obj, id){
        var returnVal = "";

        for (var i = 0; i < obj.length; i++) {
            if(obj[i].id === id){
                returnVal = obj[i];
                break;
            }
        }

        return returnVal;
    };

    var routes = {
        new: function(){

            q.all([ApiData.imageList(), ApiData.regionsList(), ApiData.sizesList(), ApiData.sshList()]).then(function(data){
                var images = parseApiData(data[0]);
                var regions = parseApiData(data[1]);
                var sizes = parseApiSizes(data[2]);
                var sshkeys = parseApiData(data[3]);

                var questions = [
                    {
                        name: "name",
                        message: 'What do you want to call your droplet?',

                    },
                    {
                        name: "region",
                        message: 'Which region do you want to use?',
                        choices: regions,
                        type: "list"
                    },
                    {
                        name: "size",
                        message: 'Which size do you want to use?',
                        choices: sizes,
                        type: "list"
                    },
                    {
                        name: "image",
                        message: 'Which image do you want to use?',
                        choices: images,
                        type: "list"
                    }
                ];

                if(sshkeys.length){
                    questions.push({
                        name: "sshkey",
                        message: 'Which ssh key do you want to use?',
                        choices: sshkeys,
                        type: "list"
                    });
                }

                inquirer.prompt(questions, function( answers ) {
                    var options = {
                        name: answers.name,
                        size_id: answers.size,
                        image_id: answers.image,
                        region_id: answers.region
                    };

                    console.log("Name: " + answers.name);
                    console.log("Size: " + _.where(sizes, {
                        slug: answers.size
                    })[0].slug);

                    console.log("Price: $" + _.where(sizes, {
                        slug: answers.size
                    })[0].price_monthly + " per month");

                    console.log("Image: " + findData(images, answers.image).name);
                    console.log("Region: " + findData(regions, answers.region).name);

                    var confirm = [
                        {
                            name: "confirmDroplet",
                            message: 'Do you want to create this droplet?',
                            type: 'confirm'
                        }
                    ];

                    if(typeof answers.sshkey === "number"){
                        options.ssh_key_ids = [answers.sshkey];
                    }

                    inquirer.prompt(confirm, function( answers ) {
                        if(answers.confirmDroplet){
                            //Connection.droplets.new(options, function(newDroplet) {
                            //    console.log('Created droplet: ', newDroplet);
                            //});
                        }
                    });
                });
            });
        },
        addkey: function(){
            //Only load the public keys
            var keys = parseFileList(fs.readdirSync(USERHOME + "/.ssh/"));        

            var questions = [
                {
                    name: "name",
                    message: 'What do you want to call your key?'
                },
                {
                    name: "key",
                    message: 'Which key do you want to use?',
                    choices: keys,
                    type: "list"
                }
            ];

            inquirer.prompt(questions, function( answers ) {
                var sshKey = "";

                if (fs.existsSync(USERHOME + "/.ssh/" + answers.key)) {
                    sshKey = fs.readFileSync(USERHOME + "/.ssh/" + answers.key, "utf8");
                
                    putData.sshAdd({
                        name: answers.name,
                        ssh_pub_key: sshKey
                    });
                }
            });
        },
        droplets: function(){
            ApiData.dropletsList().then(function(droplets){
                var dropletNames = droplets.map(function(droplet) {
                    return {
                        value: droplet.id,
                        name: droplet.name
                    };
                });

                inquirer.prompt({
                    name: 'droplet',
                    type: 'list',
                    message: 'Which droplet are you looking for?',
                    choices: dropletNames
                }, function( answers ) {
                    console.log(answers)
                });

            });
        },
        manage: function(){
            ApiData.dropletsList().then(function(droplets){
                var dropletsList = parseApiData(droplets);

                var questions = [
                    {
                        name: "dropletId",
                        message: 'Which droplet do you want to manage?',
                        choices: dropletsList,
                        type: "list"
                    }
                ];

                inquirer.prompt(questions, function( answers ) {
                    var manageDroplet = new ManageDroplet(answers.dropletId);
                    manageDroplet.prompt();
                });
            });
        },
        ask: function(){
            var questions = [
                {
                    name: "action",
                    message: 'What would you like to do?',
                    choices: [
                        {
                            value: 'droplets',
                            name: 'Manage existing droplet'
                        },
                        {
                            value: 'new',
                            name: 'Create droplet'
                        }
                    ],
                    type: "list"
                }
            ];

            inquirer.prompt(questions, function( answers ) {
                if (answers.action === "droplets") {
                    routes.manage();
                }
                else if (answers.action === "new") {
                    routes.new();
                }
            });
        }
    };

    return {
        init: function(){
            //Setup option parsing
            program
                .version(pjson.version)
                .option('--new', 'Create a new droplet')
                .option('--addkey', 'Add a new ssh key for using with new droplets')
                .option('--droplets', 'View a list of droplets')
                .option('--manage', 'Manage a droplet')
                .parse(process.argv);

            if(program.new === true){
                routes.new();
            }
            else if(program.addkey === true){
                routes.addkey();
            }
            else if(program.droplets === true){
                routes.droplets();
            }
            else if(program.manage === true){
                routes.manage();
            }
            else{
                routes.ask();
            }

        }
    };
}());

cli.init();