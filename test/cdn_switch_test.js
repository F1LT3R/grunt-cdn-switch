'use strict';

var grunt = require('grunt')
  , fs = require('fs')
  , Promise = require('bluebird')
  ;


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


var exists = function (file) {
  return new Promise(function (resolve, reject) {
    fs.exists(file, function (file_exists) {
      if (file_exists) {
        resolve(file);
      } else {
        reject(file);
      }
    });
  });
};



exports.cdn_switch = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },


  basic_local_config: function(test) {
    test.expect(2);

    var actual = grunt.file.read('dest/basic/basic-local-config.html');
    var expected = grunt.file.read('test/expected/basic-local-config.html');
    test.equal(actual, expected, 'basic-local-config should work.');


    var promiseStack = [
      exists('dest/basic/js/angular-animate.js'),
      exists('dest/basic/js/angular-ui-router.min.js'),
      exists('dest/basic/js/angular.min.js'),
    ];

    Promise.settle(promiseStack).then(function(results){
      var errorCount = 0;

      // Log errors when things are not fetched...
      results.forEach(function (result) {
        if (!result.isFulfilled()) {
          errorCount += 1;
          console.log('LOCAL FILE DOES NOT EXIST:');
          console.log(result);
        }
      });

      test.equal(errorCount, 0);
      test.done();
    });
  },

  newer_local_config: function(test) {
    test.expect(2);

    var actual = grunt.file.read('dest/newer/newer-local-config.html');
    var expected = grunt.file.read('test/expected/newer-local-config.html');
    test.equal(actual, expected, 'newer-local-config should work.');


    var promiseStack = [
      exists('dest/newer/js/jquery-latest.js'),
    ];

    Promise.settle(promiseStack).then(function(results){
      var errorCount = 0;

      // Log errors when things are not fetched...
      results.forEach(function (result) {
        if (!result.isFulfilled()) {
          errorCount += 1;
          console.log('LOCAL FILE DOES NOT EXIST:');
          console.log(result);
        }
      });

      test.equal(errorCount, 0);
      test.done();
    });
  },


  cdn_config: function(test) {
    test.expect(2);

    var actual = grunt.file.read('dest/cdn/cdn-config.html');
    var expected = grunt.file.read('test/expected/cdn-config.html');
    test.equal(actual, expected, 'cdn-config should work.');


    var promiseStack = [
      exists('dest/newer/js/jquery-latest.js'),
    ];

    Promise.settle(promiseStack).then(function(results){
      var errorCount = 0;

      // Log errors when things are not fetched...
      results.forEach(function (result) {
        if (!result.isFulfilled()) {
        } else {
          errorCount += 1;
          console.log('LOCAL SHOULD NOT NOT EXIST (but:');
          console.log(result);
        }
      });

      test.equal(errorCount, 1);
      test.done();
    });
  },

};