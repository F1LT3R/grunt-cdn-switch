/*
 * grunt-cdn-switch
 * https://github.com/alistair/grunt-cdn-switch
 *
 * Copyright (c) 2015 Alistair MacDonald
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['dest']
    },

    cdn_switch: {

      'basic-local-config': {
        files: {
          'dest/basic/basic-local-config.html': ['test/fixtures/basic-local-config.html']
        },
        options: {
          use_local: true,
          blocks: {
            javascript: {
              local_path: 'dest/basic/js',
              html: '<script src="{{resource}}"></script>',
              resources: [
                'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.min.js',
                'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.js',
                'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
              ],
            },
          }
        }
      },

      'newer-local-config': {
        files: {
          'dest/newer/newer-local-config.html': ['test/fixtures/newer-local-config.html']
        },
        options: {
          use_local: {
            fetch_newer: true,
          },
          blocks: {
            javascript: {
              local_path: 'dest/newer/js',
              html: '<script src="{{resource}}"></script>',
              resources: [
                'http://code.jquery.com/jquery-latest.js',
              ],
            },
          }
        }
      },


      'cdn-config': {
        files: {
          'dest/cdn/cdn-config.html': ['test/fixtures/cdn-config.html']
        },
        options: {
          use_local: false,
          blocks: {
            javascript: {
              local_path: 'dest/cdn/js',
              html: '<script src="{{resource}}"></script>',
              resources: [
                'http://code.jquery.com/jquery-latest.js',
              ],
            },
          }
        }
      },

    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'cdn_switch', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);
  // grunt.registerTask('default', ['cdn_switch']);
};
