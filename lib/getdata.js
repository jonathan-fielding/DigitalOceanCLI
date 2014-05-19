var q = require('q');
var Connection = require("./connection");

var getData = {
    dropletsList: function(){
        var deferred = q.defer();

        Connection.droplets.all(function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    dropletById: function(id){
        var deferred = q.defer();

        Connection.droplets.get(id, function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    imageList: function(){
        var deferred = q.defer();

        Connection.images.all(function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    regionsList: function(){
        var deferred = q.defer();

        Connection.regions.all(function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    regionById: function(id){
        var deferred = q.defer();

        Connection.regions.get(id, function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    sizesList: function(){
        var deferred = q.defer();

        Connection.sizes.all(function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    sizeById: function(id){
        var deferred = q.defer();

        Connection.sizes.get(id, function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    },
    sshList: function(){
        var deferred = q.defer();

        Connection.ssh_keys.all(function(data){
            deferred.resolve(data);
        });

        return deferred.promise;
    }
};

module.exports = getData;