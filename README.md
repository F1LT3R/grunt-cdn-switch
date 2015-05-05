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

With `grunt-cdn-switch`, you can replace HTML Comment Blocks with lists of resources. These resources can pull from a remote CDN repository, or from local script files. For example: the following `<!--cdn-switch=javascript-->` can be replace with a list of
`<script>` tags.

**Before**

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

**After**

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


Define your list of resources in Grunt.

```javascript
grunt.initConfig({
  cdn_switch: {
    'myDevTarget': {
      files: {
        'dest/index.html': ['templates/index.html']
      },
      options: {
        cdn: false,
        fetch_new: true,
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


When you want to use CDN versions of your resources, your `Gruntfile.js` might look like this:

```javascript
grunt.initConfig({
  cdn_switch: {
    'myProdTarget': {
      files: {
        'dest/index.html': ['templates/index.html']
      },
      options: {
        cdn: true,
        blocks: {
          javascript: {
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

The above `Gruntfile.js` config would produce something like this:

```html
<!DOCTYPE html>
<html>
<head>
</head>
<body>
<script src="http://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.min.js"></script>
<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-animate.js"></script>
<script src="http://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js"></script>
</body>
</html>
```

Here is a more detailed example with comments:

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
          cdn: false,
          // Always fetch resources when remote files are newer that local
          // or when local files do not exist.
          fetch_new: true,
          
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

            // Here we define our second block, this time, for CSS resources,
            // we are still defining this block in the same HTML file as before.
            css: {
              
              // "local-path" is where ee will store the local versions of these files
              local_path: 'dest/css',

              // We want to wrap our CSS resources in <LINK> tags.
              html: '<link href="{{resource}}" rel="stylesheet"/>',
              
              // And we only have once CSS resource to load
              resources: [
                'http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',
              ],
            },
          },
        },
      },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  cdn_switch: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  cdn_switch: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
