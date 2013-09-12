var assert = require('assert');
var support = require('./support');
var memcached_client = require('../lib/memcached_client');
var couchbase_client = require('../lib/couchbase_client');

function get_data() {
    return {
        foo: support.random.string(),
        blah: {
            bazz: [support.random.string(), support.random.string()]
        }
    };
}

describe("couchnode / node-memcached compatibility tests", function () {
    var data;
    var key;
    var mc_client;
    var cb_client;

    before(function (done) {
        memcached_client.connect(function (err, conn) {
            assert.ifError(err);
            mc_client = conn.memcached;

            couchbase_client.connect(function (err, conn) {
                assert.ifError(err);
                cb_client = conn;
                done();
            });
        });
    });

    after(function () {
        mc_client.end();
        cb_client.shutdown();
    });

    context("when data is an object", function () {
        context("and data is saved via memcached client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = get_data();

                mc_client.set(key, data, 0, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    result.value = JSON.parse(result.value);
                    assert.deepEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.deepEqual(result, data);
                    done();
                });
            });
        });

        context("and data is saved via couchbase client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = get_data();

                //cb_client.set(key, data, {format: 'json', flags: 2}, function (err, result) {
                cb_client.set(key, data, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.deepEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    // Since we have already saved tons of data via the
                    // memcached client, it would be good if the result would
                    // 'just work' like it does when the data is saved via
                    // memcached client.
                    //
                    // The memcached client parses data via JSON.parse() when
                    // the flags are set to '2'.
                    // See: https://github.com/3rd-Eden/node-memcached/blob/master/lib/memcached.js#L496
                    assert.deepEqual(result, data);
                    done();
                });
            });
        });
    });
});
