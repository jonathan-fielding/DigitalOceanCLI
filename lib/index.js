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

//Connection to the API
var Connection = require("./connection");

//Droplet management constructor
var ManageDroplet = require("./manage");

//Module to handle creating new droplets
var NewDroplet = require("./new");

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

    var parseFileList = function(data){
        var arr = [];

        for (var i = 0; i < data.length; i++) {
            if(data[i].match(/([A-Za-z_])+(.pub)/g)){
                arr.push(data[i]);
            }
        }

        return arr;
    };

    var routes = {
        new: function(){

            q.all([ApiData.imageList(), ApiData.regionsList(), ApiData.sizesList(), ApiData.sshList()]).then(function(data){
                var images = parseApiData(data[0]);
                var regions = parseApiData(data[1]);
                var sizes = parseApiData(data[2]);
                var sshkeys = parseApiData(data[3]);

                var questions = [
                    {
                        name: "name",
                        message: 'What do you want to call your droplet?'
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

                    if(typeof answers.sshkey === "number"){
                        options.ssh_key_ids = [answers.sshkey];
                    }

                    Connection.droplets.new(options, function(newDroplet) {
                        console.log('Created droplet:', newDroplet);
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
                console.log(droplets);
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
                program.help();
            }

        }
    };
}());

cli.init();