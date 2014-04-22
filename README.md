couchnode - node-memcached compatibility tests
======================

## Installation

    git clone git@github.com:BryanDonovan/couchnode-memcached-compat.git

Also requires a couchbase server running. Tested on version 2.1.1-764-rel.


## Tests

To run tests, first run:

    npm install

Then modify the settings.js file (and/or set up a bucket named 'test' with proxy port 11216).

Run the tests:

    `npm start`

Currently the only test in the suite is ``test/compatibility.unit.js``.

## Contribute

If you would like to contribute to the project, please fork it and send us a pull request.  Please add tests
for any new features or bug fixes.  Also run ``make`` before submitting the pull request.


## License

couchnode-memcached-compat licensed under the MIT license. See LICENSE file.
