'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.cdn_switch = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  dev_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/index-dev.html');
    var expected = grunt.file.read('test/expected/index-dev.html');
    test.equal(actual, expected, 'default dev settings should work.');

    test.done();
  },
  prod_options: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/index-prod.html');
    var expected = grunt.file.read('test/expected/index-prod.html');
    test.equal(actual, expected, 'default prod settings should work.');

    test.done();
  },

};
