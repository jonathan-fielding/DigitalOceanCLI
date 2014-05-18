#! /usr/bin/env node
/*
 * DigitalOceanCLI
 * https://github.com/jonathan-fielding/DigitalOceanCLI
 *
 * Copyright (c) 2014 Jonathan Fielding
 * Licensed under the MIT license.
 */

'use strict';

var program = require('commander');
var pjson = require('../package.json');
var fs = require('fs');
var digitaloceanApi = require('digitalocean').Api;
var q = require('q');
var inquirer = require("inquirer");

var cli = (function(){
    var apiKeys = {};
    var apiConnection = null;
    var USERHOME = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

    var parseApiKeys = function(){
        var data = null;

        if (fs.existsSync(USERHOME + "/.digitalocean.json")) {
            data = fs.readFileSync(USERHOME + "/.digitalocean.json");
            apiKeys = JSON.parse(data);
        }
        else{
            return false;
        }
    };

    var setupApiKeys = function(){
        var questions = [
            {
                name: "clientID",
                message: 'Digital Ocean Client ID?'
            },
            {
                name: "apiKey",
                message: 'Digital Ocean API KEY?'
            }
        ];

        inquirer.prompt(questions, function( answers ) {
            fs.writeFile(USERHOME + "/.digitalocean.json", JSON.stringify(answers), function (err) {
                if (err) {
                  console.log('There has been an error saving your configuration data.');
                  console.log(err.message);
                  return;
                }
                console.log('Configuration saved successfully.');
             });
        });
    };

    var parseRoute = function(){
        if(program.new === true){
            routes.new();
        }
        else if(program.addkey === true){
            routes.addkey();
        }
    };

    var getData = {
        imageList: function(){
            var deferred = q.defer();

            apiConnection.images.all(function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        regionsList: function(){
            var deferred = q.defer();

            apiConnection.regions.all(function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        sizesList: function(){
            var deferred = q.defer();

            apiConnection.sizes.all(function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        },
        sshList: function(){
            var deferred = q.defer();

            apiConnection.ssh_keys.all(function(data){
                deferred.resolve(data);
            });

            return deferred.promise;
        }

    };

    var putData = {
        sshAdd: function(data){
            var deferred = q.defer();

            apiConnection.ssh_keys.new(data, function(returnData){
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

            q.all([getData.imageList(), getData.regionsList(), getData.sizesList(), getData.sshList()]).then(function(data){
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

                    apiConnection.droplets.new(options, function(newDroplet) {
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
        }
    };

    return {
        init: function(){
            //Setup option parsing
            program
                .version(pjson.version)
                .option('--new', 'Create a new droplet')
                .option('--addkey', 'Add a new ssh key for using with new droplets')
                .parse(process.argv);
        
            if(parseApiKeys() === false){
                setupApiKeys();
            }
            else{
                apiConnection = new digitaloceanApi(apiKeys.clientID, apiKeys.apiKey);
                parseRoute();
            }
        }
    };
}());

cli.init();

