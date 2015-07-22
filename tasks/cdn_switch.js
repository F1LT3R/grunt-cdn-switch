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


    var target = this.target;

    // Go async (fetching and waiting on remote servers)
    var done = this.async();

    // Reference options
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });



    function checkFileExists(file){
      var path = file.path;
      return new Promise(function(resolve, reject){
        fs.exists(path, function(exists) {

          resolve({
            path: path,
            origin: file.origin,
            exists: exists
          });

        });

      });
    }

    function checkFileModifiedDate(file){
      var path = file.path;

      return new Promise(function(resolve, reject){

        if (file.exists) {

          fs.stat(path, function(err, stats){
            resolve({
              path: path,
              origin: file.origin,
              modified: stats.mtime,
              exists: true
            });
          });

        } else {

          resolve({
            path: path,
            origin: file.origin,
            modified: null,
            exists: false
         });

        }
      });
    }


    // Request a new file from the server, handle date-modified, error and end
    // events. Don't fetch file if you already have it locally.
    function requestHandler(file){
      return new Promise(function(resolve, reject){

        var request = http.get(file.origin, function (response) {

          var localTime = new Date(file.modified).getTime()
            , remoteTime = new Date(response.headers['last-modified']).getTime()
            ;

          // If the remote file is newer than the local file...
          // Or the local file does not exist...
          if ( (remoteTime > localTime && options.use_local.fetch_newer ) || !file.exists) {

            // Write the file.
            var local_file = fs.createWriteStream(file.path);
            response.pipe(local_file);

          // Duck out if there are HTTP Status code errors
          } else {
            request.end();
            resolve({
              notmodified: true,
              path: file.path
            });
          }

          // Duck out if there are HTTP Status code errors
          if (response.statusCode.toString()[0] === '4'){
            var error = {};
            error[response.statusCode] = file.url;
            reject(error);
          }

        // Handle other events
        }).on('error', function(e){
          reject(e);
        }).on('end', function(){
          resolve(file.origin);
        }).on('close', function(){
          resolve(file.origin);
        });

      });
    }


    // Begin the fetch and date-modified check for a single fetch promise
    function check(fetchobj){
      var block = fetchobj.block
      , filename = fetchobj.url.slice(fetchobj.url.lastIndexOf('/') + 1)
      , local_filepath = block.local_path + '/' + filename
      ;

      if (options.use_local.fetch_newer) {
        grunt.log.writeln('Compare: ' + fetchobj.url + ' === ' + local_filepath);
      } else if (options.use_local) {
        grunt.log.writeln('Check: ' + local_filepath);
      }

      return checkFileExists({
        path: local_filepath,
        origin: fetchobj.url
      })
      .then(checkFileModifiedDate)
      .then(requestHandler);
    }




    // Build a stack of promises based on the resource list
    function check_files (block) {
      return new Promise(function (resolve, reject) {

        var fetchPromises = [];

        block.resources.forEach(function(url){
          fetchPromises.push(check({
            block: block,
            url: url
          }).then(function (response){

            if (!response.notmodified && options.use_local.fetch_newer) {
              grunt.log.writeln('Remote newer: ' + response);
            } else if (response.notmodified && options.use_local.fetch_newer) {
              grunt.log.writeln('Remote not newer: ' + response.path);
            } else if (response.notmodified && options.use_local) {
              grunt.log.writeln('Exists: ' + response.path);
            } else if (options.use_local) {
              grunt.log.writeln('Fetch non-existing: ' + response);
            }

            return response.path;
          }));

          return fetchPromises;

        });

        // Wait until all the promises are resolved, then settle
        Promise.settle(fetchPromises).then(function(results){
          grunt.log.writeln('Done fetching/checking resources.');
          var errorCount = 0;

          // Log errors when things are not fetched...
          results.forEach(function(result){
            if (!result.isFulfilled()) {
              errorCount+=1;

              grunt.log.warn('Fetch Error in resources for block: \''+block.name+'\', in target \''+target+'\'.');
              try{
                console.log(result.reason());
              }catch(e){
                console.log(e);
              }
            }
          });

          // Count errors and notify user
          if (errorCount === 0) {
            var success_msg = '\''+block.name+'\' files checked-with/fetched-to: \''+block.local_path+'\'';
            grunt.log.ok(success_msg);
            resolve(success_msg);
          } else {
            var error_msg = 'CDN-Switch: Things did not go well for you :\'(';
            grunt.log.warn(error_msg);
            reject(error_msg);
          }
        });

      });
    }


    // Build HTML block with reource links pointing at CDN
    function buildHtmlBlockCDN(block){
      var parts = block.html.split('{{resource}}')
        , html = ''
        ;

      block.resources.forEach(function(resource){
        html += parts[0] + resource + parts[1] + '\n';
      });


      if (block.injections) {
        block.injections.forEach(function(injection){
          // html += parts[0] + injection + parts[1] + '\n';
          html += injection + '\n';
          return injection;
        });
      }

      // Remove trailling newline
      html = html.slice(0, html.length-1);
      return html;
    }

    // Build HTML block with reource links pointing to Local
    // versions of CDN files that were fetched
    function buildHtmlBlockLocal(block){
      var parts = block.html.split('{{resource}}')
        , html = ''
        ;

      block.resources.forEach(function(url){
        var filename = url.slice(url.lastIndexOf('/')+1);
        html += parts[0] + block.local_path+'/'+filename + parts[1] + '\n';
      });


      if (block.injections) {
        block.injections.forEach(function(injection){
          html += injection + '\n';
          // html += parts[0] + injection + parts[1] + '\n';
          return injection;
        });
      }

      // Remove trailling newline
      html = html.slice(0, html.length-1);
      return html;
    }


    // Filter HTML files in the Grunt files list
    function filterHtml(obj){
      obj.node.children.forEach(function(child){

        if (child.type === 'comment'){
          var splits = child.data.split('=');

          // Scan an HTML file for comment nodes that contain "cdn-switch"
          // and a target name for the grunt task.
          // Eg: <!--cdn-switch:tagert-name-->

          // When found...
          if (splits[0]==='cdn-switch' && splits[1]===obj.block.name) {

            // Build new HTML blockdepending on mode...
            var html = options.use_local ?
              buildHtmlBlockLocal(obj.block) :
              buildHtmlBlockCDN(obj.block) ;

            // Write new block into DOM and notify
            obj.$(child).replaceWith(html);

            grunt.log.ok('Write: \''+obj.block.name+'\' comment block written to: \''+obj.dest+'\'');
          }
        }

        // If this node has children, recursively filter
        if (child.hasOwnProperty('children')){
          filterHtml({
            $: obj.$,
            dest: obj.dest,
            node: child,
            block: obj.block
          });
        }
      });
    }



    // BEGIN HERE
    ////////////////////////////////////////////////////////////////////////////

    // Iterate over all specified fi groups.
    this.files.forEach(function (f) {

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




      function compileHTML (block, src) {
        // Load the HTML file into Cheerio DOM parser
        var $ = cheerio.load(src);

        //Scan the DOM for places to switch CDN/Local resources
        filterHtml({
          $: $,
          dest: f.dest,
          node: $._root,
          block: block
        });

        // Flatten the DOM back to a string
        src = $.html();

        insertedBlocks = true;

        return src;
      }



      var insertedBlocks = false
        , promiseStack = []
        ;

      // For each block in the target...
      for (var blockName in options.blocks){

        var block = options.blocks[blockName];
        block.name = blockName;

        mkdirp(block.local_path);

        if (options.use_local) {
          promiseStack.push(check_files(block));
        }

        src = compileHTML(block, src);
      }


      Promise.settle(promiseStack).then(function () {

        // Write out the HTML string to the destination file
        if (insertedBlocks) {
          grunt.file.write(f.dest, src);
        }

        // Print a success message.
        grunt.log.writeln('File "' + f.dest + '" created.');

        done();
      });



    });

  });

};