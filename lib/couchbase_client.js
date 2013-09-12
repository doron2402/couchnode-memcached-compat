var couchbase = require('couchbase');
var settings = require('../settings');

var couchbase_client = {
    connect: function (cb) {
        var conn = new couchbase.Connection(settings.couchbase, function (err) {
            cb(err, conn);

            conn.on("error", function (message) {
                console.log("Couchbase ERROR: [" + message + "]");
            });
        });
    }
};

module.exports = couchbase_client;
