# grunt-cdn-switch

> Insert switchable Script and Style tags into your HTML that automatically link to Local or CDN resources.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-cdn-switch --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-cdn-switch');
```

## The "cdn_switch" task

### Overview

With `grunt-cdn-switch`, you can replace `<!-- HTML Comment Blocks -->` with HTML templates containing resource links, to files such as JavaScript or CSS. These resources are pulled from a remote CDN repository, stored locally and updated when the CDN file is newer than the local file.

This provides an easy way to develop locally without having to rely on fetching resources from a CDN (especially useful when developing in a coffee shop or on a train. At the same time your resources will can stay up-to-date with the latest versions that the CDN provides.

The typical use case for `grunt-cdn-switch` is as follows: 

 - As a Developer, I would like to use local JavaScript files to develop on my laptop, even when the stability of my Internet connection is poor, so that my flow is not disrupted and I can focus on my work where ever I may be.
 - As a Dev-Ops Engineer, I would like to have the code loaded from CDNs when running in production, as I do not wish to create additional load on my server where it is not necessary.
 - As a Security Analyst, I would like to store the code locally when building in production, so that I do not have to rely on a CDN using an untrusted security certificate.

For example: the following `<!--cdn-switch=javascript-->` can be replace with a list of
`<script>` tags.

#### Before

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<!--cdn-switch=javascript-->
</body>
</html>
```

#### After

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script src="dest/js/angular.min.js"></script>
<script src="dest/js/angular-animate.js"></script>
<script src="dest/js/angular-ui-router.min.js"></script>
</body>
</html>
```


#### Basic Local Config

Use a configuration like this when you want to fetch resources "only once" from the CDN, and store them in your local path.

This configuration will:

 1. Fetch the resources from the CDN (when not found in `local_path`)
 2. Store resources in the `local_path`
 3. Replace the HTML comment block with `<script>` tags linking to the `local_path` resources

**Config:**

```javascript
grunt.initConfig({
  cdn_switch: {
    'myDevTarget': {
      files: {
        'dest/index.html': ['templates/index.html']
      },
      options: {
        use_local: true,
        blocks: {
          javascript: {
            local_path: 'dest/js',
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
  }
});
```

**Output:**

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script src="dest/js/angular.min.js"></script>
<script src="dest/js/angular-animate.js"></script>
<script src="dest/js/angular-ui-router.min.js"></script>
</body>
</html>
```


#### Fetch_Newer Local Config

Use a configuration like this when you want your local files to stay up-top-date with the CDN.

This configuration will:

 1. Fetch the resources from the CDN (when newer than resources found in `local_path`)
 2. Store any newer resources in the `local_path`
 3. Replace the HTML comment block with `<script>` tags linking to the `local_path` resources

**Config:**

```javascript
grunt.initConfig({
  cdn_switch: {
    'myDevTarget': {
      files: {
        'dest/index.html': ['templates/index.html']
      },
      options: {
        use_local: {
          fetch_newer: true,
        },
        blocks: {
          javascript: {
            local_path: 'dest/js',
            html: '<script src="{{resource}}"></script>',
            resources: [
              'http://code.jquery.com/jquery-latest.js',
            ],
          },
        }
      }
    },
  }
});
```

**Output:**

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script src="dest/js/jquery-latest.js"></script>
</body>
</html>
```


#### CDN Config

Use a configuration like this when you do not want to store any of the files locally, and you want to include script tags that link to your resources on the CDN.

This configuration will:

 1. Replace the HTML comment block with `<script>` tags linking to the `local_path` resources

**Config:**

```javascript
grunt.initConfig({
  cdn_switch: {
    'myDevTarget': {
      files: {
        'dest/index.html': ['templates/index.html']
      },
      options: {
        use_local: false,
        blocks: {
          javascript: {
            local_path: 'dest/js',
            html: '<script src="{{resource}}"></script>',
            resources: [
              'http://code.jquery.com/jquery-latest.js',
            ],
          },
        }
      }
    },
  }
});
```

**Output:**

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script src="http://code.jquery.com/jquery-latest.js"></script>
</body>
</html>
```



### Options

#### options.use_local
Type: `boolean`
Default value: `false`

When `use_local:true` grunt-cdn-switch will:

 1. Fetch any files not found in `local_path`
 2. Replace the HTML comment block with `<script>` tags linking to the `local_path` resources

When `use_local:false` grunt-cdn-switch will:

 0. Download nothing
 1. Replace the HTML comment block with `<script>` tags linking to the CDN resources

#### options.use_local.fetch_new
Type: `boolean`
Default value: `false`

When `options.use_local.fetch_new:true` grunt-cdn-switch will:

 1. Fetch any files not found in `local_path`
 2. Overwrites any files in `local_path` that are older than the _last-modified) dates of their CDN links
 3. Replace the HTML comment block with `<script>` tags linking to the `local_path` resources


#### options.blocks.`[name]`

When invoked, grunt-cdn-switch looks for HTML Comment Blocks, for example: `<!--cdn-switch:javascript-->` and will replace this block with the resources that you list. You can have as many block names for a grunt target as you wish.

Typically you might see one for JavaScript and one for CSS, like this:

```javascript
grunt.initConfig({
  cdn_switch: {
    'myTarget': {
      options: {
        blocks: {
          javascript: {
            local_path: 'dest/js',
            html: '<script src="{{resource}}"></script>',
            resources: [
              'http://cdn.com/resource.min.js',
            ]
          },
          css: {
            local_path: 'dest/css',
            html: '<link href="{{resource}}" rel="stylesheet"></script>',
            resources: [
              'http://cdn.com/resource.min.css',
            ]
          },
        }
      }
    }
  }
});
```

#### options.blocks.`[name]`.html
Type: `String`
Default value: 'null`

This string represents an HTML fragment that will wrap the link to your resource. For example: where `options.html` is `'<script src="{{resource}}"></script>'`, the text `{{resource}}` will be replaced by either a CDN or a local resource link.

Thus the output where `cdn` equals `true` might be:

```html
<script src="http://cdn.com/resource.min.js"></script>
```

And the output where `cdn` equals `false` and `local_path` equals `/dest/js` might be:

```html
<script src="/dest/js/resource.min.js"></script>
```


#### options.blocks.`[name]`.local_path

Type: `String`
Default value: 'null`

This string is the path that your CDN resources will be saved to when fetched, and will also be used to write the HTML block for your resources when `use_local` is `false`.


### Usage Examples

#### A Detailed Development Example

Here is a more detailed example with comments that uses all of the features of `grunt-cdn-switch`.

##### HTML Before

```html
<!DOCTYPE html>
<html>
<head>
<!--cdn-switch=css-->
</head>
<body>
<!--cdn-switch=javascript-->
</body>
</html>
```

##### Configuration

```js
grunt.initConfig({
  cdn_switch: {
    // The grunt target for different deployment/development tasks, 
    // here we are going to set things up for local development. We
    // want to fetch files from a CDN when they do not exist locally,
    // but we want to write a block of <script> tags that use local
    // links.
    'myDevTarget': {
      files: {
        // Left: file to write to, right: file to consume
        'dest/index.html': ['templates/index.html']
      },
      options: {
        // When false, this switch causes cdn_swith to render the HTML
        // block with links to local files
        use_local: {
          // Always fetch resources when remote files are newer than local
          // or when local files do not exist.
          fetch_new: true,
        }

        // "blocks" refers to HTML comment blocks that we want to replace
        blocks: {
        // "Blocks" means comment blocks, which denotes an HTML comment,
        // Eg: <!-- Hello World! -->. In our case, we want to replace the
        // comment <!--cdn-switch:javascript--> with an HTML block of
        // resources that might be available on CDN, Eg: a block of
        // <script> tags for JavaScript.

          // Lets define our first comment-block replacement...
          javascript: {

            // "local_path" points to the local directory you would like
            // your CDN resources saved to when fetched
            local_path: 'dest/js',

            // "html" refers to the html that you want to wrap around the
            // resource URL.
            html: '<script src="{{resource}}"></script>',

            // "resources" is a list of remote resources that you want to
            // inject where the HTML comment block used to be.
            resources: [
              'http://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js',
            ],
          },

          // Here we define our second block, this time, for CSS resources,
          // we are still defining this block in the same HTML file as before.
          css: {

            // "local-path" is where ee will store the local versions of these files
            local_path: 'dest/css',

            // We want to wrap our CSS resources in <LINK> tags.
            html: '<link href="{{resource}}" rel="stylesheet"/>',

            // And we only have once CSS resource to load
            resources: [
              'http://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css',
            ],
          },
        },
      },
    },
  },
});

// Register the dev target with Grunt
grunt.registerTask('default', ['cdn_switch:myDevTarget']);
```

##### Console Output

When running the above config, the console output should look similar to this:

```shell
Running "cdn_switch:prod" (cdn_switch) task
Check: static/js/c3.min.js
>> Write: 'javascript' comment block written to: 'static/index.html'
Check: static/css/c3.min.css
>> Write: 'css' comment block written to: 'static/index.html'
Fetch non-existing: http://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css
Done fetching/checking resources.
>> 'css' files checked-with/fetched-to: 'static/css'
Fetch non-existing: http://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js
Done fetching/checking resources.
>> 'javascript' files checked-with/fetched-to: 'static/js'
File "static/index.html" created.

Done, without errors.
```


##### HTML After

```html
<!DOCTYPE html>
<html>
<head>
<link href="dest/static/c3.min.css" rel="stylesheet">
</head>
<body>
<script src="dest/static/c3.min.js"></script>
</body>
</html>
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
