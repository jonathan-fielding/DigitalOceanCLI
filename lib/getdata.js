var q = require('q');
var Connection = require("./connection");

var getData = {
    dropletsList: function(){
        var deferred = q.defer();

        Connection.dropletsGetAll({}, function(error, data){
            deferred.resolve(data.body.droplets);
        });

        return deferred.promise;
    },
    dropletById: function(id){
        var deferred = q.defer();

        Connection.dropletsGetById(id, function(error, data){
            deferred.resolve(data.body.droplet);
        });

        return deferred.promise;
    },
    imageList: function(){
        var deferred = q.defer();

        Connection.imagesGetAll({}, function(error, data){
            deferred.resolve(data.body.images);
        });

        return deferred.promise;
    },
    regionsList: function(){
        var deferred = q.defer();

        Connection.regionsGetAll({}, function(error, data){
            deferred.resolve(data.body.regions);
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

        Connection.sizesGetAll({}, function(error, data){
            deferred.resolve(data.body.sizes);
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

        Connection.accountGetKeys({}, function(error, data){
            deferred.resolve(data.body.ssh_keys);
        });

        return deferred.promise;
    }
};

module.exports = getData;