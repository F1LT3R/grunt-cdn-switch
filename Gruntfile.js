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
      tests: ['tmp']
    },

    cdn_switch: {
      javascript: {
        files: {
          'tmp/index.html': ['test/fixtures/index.html']
        },
        options: {
          template: '<script src="{{remote}}"></script>',
          always_fetch: false,
          local_path: 'tmp/static',
          remote: [
            'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.js',
            'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
            'http://tombatossals.github.io/angular-leaflet-directive/dist/angular-leaflet-directive.min.js',
            'http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',
            'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
            'http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js',
            'http://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js',
          ],

        },
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
  // grunt.registerTask('default', ['jshint', 'test']);

  grunt.registerTask('default', ['cdn_switch']);

};
