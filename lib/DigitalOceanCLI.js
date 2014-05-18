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
        }
    };

    var parseApiData = function(data){
        for (var i = data.length - 1; i >= 0; i--) {
            data[i].value = data[i].id;
        }

        return data;
    };

    var routes = {
        new: function(){

            q.all([getData.imageList(), getData.regionsList(), getData.sizesList()]).then(function(data){
                var images = parseApiData(data[0]);
                var regions = parseApiData(data[1]);
                var sizes = parseApiData(data[2]);

                var questions = [
                    {
                        name: "name",
                        message: 'Which do you want to call your droplet?'
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

                inquirer.prompt(questions, function( answers ) {
                    apiConnection.droplets.new({
                        name: answers.name,
                        size_id: answers.size,
                        image_id: answers.image,
                        region_id: answers.region
                    }, function(newDroplet) {
                        console.log('Created droplet:', newDroplet);
                    });
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

