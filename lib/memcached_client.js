var Memcached = require('memcached');
var settings = require('../settings');

var memcached_client = {
    connect: function (cb) {
        var memcached = new Memcached(settings.memcached.hosts);
        memcached.connect(settings.memcached.hosts, cb);
    }
};

module.exports = memcached_client;
