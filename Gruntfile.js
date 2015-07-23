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
      // EXAMPLE from README:
      // 'myDevTarget': {
      //   files: {
      //     // Left: file to write to, right: file to consume
      //     'dest/index.html': ['templates/index.html']
      //   },
      //   options: {
      //     // When false, this switch causes cdn_swith to render the HTML
      //     // block with links to local files
      //     cdn: false,
      //     // Always fetch resources when remote files are newer that local
      //     // or when local files do not exist.
      //     fetch_new: true,

      //     // "blocks" refers to HTML comment blocks that we want to replace
      //     blocks: {
      //     // "Blocks" means comment blocks, which denotes an HTML comment,
      //     // Eg: <!-- Hello World! -->. In our case, we want to replace the
      //     // comment <!--cdn-switch:javascript--> with an HTML block of
      //     // resources that might be available on CDN, Eg: a block of
      //     // <script> tags for JavaScript.

      //       // Lets define our first comment-block replacement...
      //       javascript: {

      //         // "local_path" points to the local directory you would like
      //         // your CDN resources saved to when fetched
      //         local_path: 'dest/js',

      //         // "html" refers to the html that you want to wrap around the
      //         // resource URL.
      //         html: '<script src="{{resource}}"></script>',

      //         // "resources" is a list of remote resources that you want to
      //         // inject where the HTML comment block used to be.
      //         resources: [
      //           'http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.min.js',
      //           'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.js',
      //           'http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js',
      //         ],
      //       },

      //       // Here we define our second block, this time, for CSS resources,
      //       // we are still defining this block in the same HTML file as before.
      //       css: {

      //         // "local-path" is where ee will store the local versions of these files
      //         local_path: 'dest/css',

      //         // We want to wrap our CSS resources in <LINK> tags.
      //         html: '<link href="{{resource}}" rel="stylesheet"/>',

      //         // And we only have once CSS resource to load
      //         resources: [
      //           'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
      //         ],
      //       },
      //     },
      //   },
      // },
      'myDevTarget': {
        files: {
          'tmp/index-dev.html': ['test/fixtures/index.html']
        },
        options: {
          blocks: {
            javascript: {
              local_path: 'tmp/static',
              html: '<script src="{{resource}}"></script>',
              resources: [
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
            css: {
              local_path: 'tmp/static',
              html: '<link href="{{resource}}" rel="stylesheet"/>',
              resources: [
                'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
              ],
            },
          },
        },
      },
      'myProdTarget': {
        files: {
          'tmp/index-prod.html': ['test/fixtures/index.html']
        },
        options: {
          blocks: {
            javascript: {
              html: '<script src="{{resource}}"></script>',
              resources: [
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
            css: {
              html: '<link href="{{resource}}" rel="stylesheet"/>',
              resources: [
                'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
              ],
            },
          },
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
  grunt.registerTask('default', ['jshint', 'test']);
  grunt.registerTask('default', ['cdn_switch:myDevTarget']);
};
