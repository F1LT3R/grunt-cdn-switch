/*
 * grunt-cdn-switch
 * https://github.com/alistair/grunt-cdn-switch
 *
 * Copyright (c) 2015 Alistair MacDonald
 * Licensed under the MIT license.
 */


'use strict';

var Promise = require('bluebird')
  , cheerio = require('cheerio')
  , http = require('http')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  ;


module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('cdn_switch', 'Insert switchable Script and Style tags into your HTML that automatically link to Local or CDN resources.', function() {
     var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });
    // console.log('opts', options.cdn);



  mkdirp(options.local_path);

  function fetch(url){
    return new Promise(function(resolve, reject) {

      var filename = url.slice(url.lastIndexOf('/')+1);
      grunt.log.writeln('Need: ' + url);

      var file = fs.createWriteStream(options.local_path+'/'+filename);

      var request = http.get(url, function(response) {
        response.pipe(file);

        if (response.statusCode.toString()[0]==='4'){
          var error = {};
          error[response.statusCode] = url;
          reject(error);
        }
      }).on('error', function(e){
        reject(e);
      }).on('end', function(){
        resolve(filename);
      }).on('close', function(){
        resolve(filename);
      });
    });
  }

    var fetchPromises = [];
    options.remote.forEach(function(url){
      var fetchFile = fetch(url)
      .then(function (filename){
          grunt.log.writeln('Got: ' + filename);
          return filename;
      });
      fetchPromises.push(fetchFile);
    });


    Promise.settle(fetchPromises).then(function(results){
      console.log('Done fetching all resources.');
      var errorCount = 0;

      results.forEach(function(result){
        if(result.isFulfilled()){
          // console.log(result);
        } else {
          errorCount+=1;
          grunt.log.error('Fetch Error: ' , result.reason());
        }
      });

      if (errorCount===0) {
        grunt.log.ok('All files fetched and saved to: \''+options.local_path+'\'');
      }
    });

    var theTarget = this.target;

    // Iterate over all specified fi groups.
    this.files.forEach(function(f) {


      var t = 0;
      function filterHtml(node){
        var childNodes = node.children;
        node.children.forEach(function(child){
          t++;

          console.log(t, child.name, child.type);
          if (child.type === 'comment'){
            var splits = child.data.split('=');

            if (splits[0]===' cdn-switch' && splits[1]===theTarget+' ') {
              // $(child).replaceWith('ok ok ok!');
              $(child).replaceWith('ok ok ok!');
            }
          }

          if (child.hasOwnProperty('children')){
            filterHtml(child);
          }
        });
      }


      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      var $ = cheerio.load(src);
      filterHtml($._root);
      src = $.html();

      // console.log('Scanned DOM in: \''+filepath+'\'');
      console.log('Scanned DOM.');

      // Handle options.
      // src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};

