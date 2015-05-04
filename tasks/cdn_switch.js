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
         });

        }
      });
    }


    // Request a new file from the server, handle date-modified, error and end
    // events. Don't fetch file if you already have it locally.
    function requestHandler(file){
      return new Promise(function(resolve, reject){
        var path = file.path
          , url = file.origin
          , localModified = file.modified
          ;

        // Beging the request. Alias for cancellation (end).
        var request = http.get(url, function(response) {
          var remoteModified = response.headers['last-modified']
            , localTime = new Date(localModified).getTime()
            , remoteTime = new Date(remoteModified).getTime()
            ;

          // If the remote file is newer than the local file...
          if (remoteTime > localTime) {

            // Write the file.
            var file = fs.createWriteStream(path);
            response.pipe(file);

          // Duck out if there are HTTP Status code errors
          } else {
            request.end();
            resolve({
              notmodified: true,
              path: path
            });
          }

          // Duck out if there are HTTP Status code errors
          if (response.statusCode.toString()[0] === '4'){
            var error = {};
            error[response.statusCode] = url;
            reject(error);
          }

        // Handle other events
        }).on('error', function(e){
          reject(e);
        }).on('end', function(){
          resolve(path);
        }).on('close', function(){
          resolve(path);
        });

      });
    }


    // Begin the fetch and date-modified check for a single fetch promise
    function fetch(fetch){
      var block = fetch.block
      , filename = fetch.url.slice(fetch.url.lastIndexOf('/') + 1)
      , local_filepath = block.local_path + '/' + filename
      ;

      grunt.log.writeln('Checking: ' + fetch.url);

      return checkFileExists({
        path: local_filepath,
        origin: fetch.url
      })
      .then(checkFileModifiedDate)
      .then(requestHandler);
    }


    // Build a stack of promises based on the resource list
    function fetch_new (block) {
      var fetchPromises = [];

      // Create a promise for each fle
      block.resources.forEach(function(url){

        // Push the new promise onto the stack
        fetchPromises.push(fetch({
          block:block,
          url: url

        }).then(function (response){

          if (response.notmodified) {
            grunt.log.writeln('Not modified: ' + response.path);
          } else {
            grunt.log.ok('Got: ' + response);
          }
          return response.path;
        }));

      });



      // Wait until all the promises are resolved, then settle
      Promise.settle(fetchPromises).then(function(results){
        grunt.log.writeln('Done fetching/checking resources.');
        var errorCount = 0;

        // Log errors when things are not fetched...
        results.forEach(function(result){
          if (!result.isFulfilled()) {
            errorCount+=1;
            grunt.log.error('Fetch Error: ' + result.reason());
          }
        });

        // Count errors and notify user
        if (errorCount === 0) {
          grunt.log.ok('\''+block.name+'\' files checked-with/fetched-to: \''+block.local_path+'\'');
        } else {
          grunt.log.error('Things did not go well for you.');
        }
      });
    }




    // Build HTML block with reource links pointing at CDN
    function buildHtmlBlockCDN(block){
      var parts = block.html.split('{{resource}}')
        , html = ''
        ;

      block.resources.forEach(function(resource){
        html += parts[0] + resource + parts[1] + ' \n';
      });

      return html;
    }

    // Build HTML block with reource links pointing to Local
    // versions of CDN files that were fetched
    function buildHtmlBlockLocal(block){
      var parts = block.html.split('{{resource}}')
        , html = ''
        ;

      // console.log(block.html);
      block.resources.forEach(function(url){
        var filename = url.slice(url.lastIndexOf('/')+1);
        html += parts[0] + block.local_path+'/'+filename + parts[1] + ' \n';
      });

      console.log('HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH', html);
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
            var html = options.cdn        ?
              buildHtmlBlockCDN(obj.block)    :
              buildHtmlBlockLocal(obj.block)  ;

              console.log(123, html);

            // Write new block into DOM and notify
            obj.$(child).replaceWith(html);

            grunt.log.ok(mode+' \''+obj.block.name+'\' comment block replaced in: \''+obj.dest+'\'');
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

    var mode = options.cdn ? 'CDN' : 'Local';

    // Iterate over all specified fi groups.
    this.files.forEach(function(f) {

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


      var insertedBlocks = false;

      // For each block in the target...
      for (var blockName in options.blocks){
        var block = options.blocks[blockName];
        block.name = blockName;

        // Decide whether to fetch for resources...
        if (options.fetch_new && !options.cdn) {
          mkdirp(block.local_path);
          grunt.log.writeln('Block \''+blockName+'\', fetch_new=true: checking CDN resources...');
          fetch_new(block);

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
          var insertedBlocks = true;
        } else {
          grunt.log.writeln('Block \''+blockName+'\', fetch_new=false: not checking CDN resources.');
        }
      }

      // Write out the HTML string to the destination file
      if (insertedBlocks) {
        grunt.file.write(f.dest, src);
      }

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });

  });

};