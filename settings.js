var settings = {
    memcached: {
        hosts: ['127.0.0.1:11216'] // needs to correspond to the bucket below.
    },

    couchbase: {
        host: 'localhost:8091',
        password: 'password',
        bucket: 'test'
    }
};

module.exports = settings;
