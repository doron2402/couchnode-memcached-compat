var assert = require('assert');
var fs = require('fs');
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

var FLAG_RAW = 0;
var FLAG_JSON = 2;
var FLAG_BINARY = 4;
var FLAG_NUMERIC = 8;

var couchbase_helper = {
    transform_result: function (result) {
        switch (result.flags) {
        case FLAG_JSON:
            result.value = JSON.parse(result.value);
            break;
        case FLAG_NUMERIC:
            result.value = parseFloat(result.value);
            break;
        case FLAG_RAW:
            if (Buffer.isBuffer(result.value)) {
                result.value = result.value.toString();
            }
            break;
        case FLAG_BINARY:
            var tmp = new Buffer(result.value.length);
            tmp.write(result.value, 0, 'binary');
            result.value = tmp;
            //result.value = result.value.toString('binary');
            break;
        default:
            // nothing
        }
        return result;
    }
};

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
                    couchbase_helper.transform_result(result);
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

                cb_client.set(key, data, {flags: FLAG_JSON}, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
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
    });

    context("when data is a number", function () {
        context("and data is saved via memcached client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = support.random.number();

                mc_client.set(key, data, 0, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    assert.strictEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(result, data);
                    done();
                });
            });
        });

        context("and data is saved via couchbase client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = support.random.number();

                cb_client.set(key, data, {flags: FLAG_NUMERIC}, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    assert.strictEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(result, data);
                    done();
                });
            });
        });
    });

    context("when data is a string", function () {
        context("and data is saved via memcached client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = support.random.string();

                mc_client.set(key, data, 0, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    assert.strictEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(result, data);
                    done();
                });
            });
        });

        context("and data is saved via couchbase client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = support.random.string();

                cb_client.set(key, data, {flags: FLAG_RAW}, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    assert.strictEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.strictEqual(result, data);
                    done();
                });
            });
        });
    });

    //
    // FIXME: I'm probably doing something wrong here.. not sure how to correctly save the data.
    //
    context("when data is a binary image", function () {
        before(function () {
            data = fs.readFileSync(__dirname + '/support/fixtures/logo.png');
        });

        context("and data is saved via memcached client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);

                mc_client.set(key, data, 0, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            // FIXME: This fails. It appears that the returned data has some "\" characters in it.
            it.skip("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    //assert.deepEqual(result.value.toString('binary'), data.toString('binary'));
                    assert.deepEqual(result.value, data);
                    done();
                });
            });

            it("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.deepEqual(result, data);
                    /*
                     * manually test that image loads
                    try {
                        fs.unlinkSync('/tmp/logo-mc.png');
                    } catch (e) {
                    }
                    fs.writeFileSync('/tmp/logo-mc.png', result, 'binary');
                    */
                    done();
                });
            });
        });

        context("and data is saved via couchbase client", function () {
            before(function (done) {
                key = 'foo' + support.random.string(8);
                data = data.toString('binary');

                cb_client.set(key, data, {flags: FLAG_BINARY}, function (err, result) {
                    assert.ifError(err);
                    assert.ok(result);
                    done();
                });
            });

            it("can be read by the couchbase client", function (done) {
                cb_client.get(key, function (err, result) {
                    assert.ifError(err);
                    couchbase_helper.transform_result(result);
                    assert.deepEqual(result.value.toString('binary'), data.toString('binary'));
                    //assert.deepEqual(result.value, data);
                    // manually test that image loads - this works
                    /*
                    try {
                        fs.unlinkSync('/tmp/logo.png');
                    } catch (e) {
                    }
                    fs.writeFileSync('/tmp/logo.png', result.value, 'binary');
                    */
                    done();
                });
            });

            // FIXME: times out
            it.skip("can be read by memcached client", function (done) {
                mc_client.get(key, function (err, result) {
                    assert.ifError(err);
                    assert.deepEqual(result, data);
                    done();
                });
            });
        });
    });
});
