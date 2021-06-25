# endif-loader

endif-loader realized Condition compiler, it can Preprocess HTML, JavaScript, and other files with directives based off custom or ENV configuration

## Configuration

Install via npm:

```bash
$ npm install --save endif-loader
```

## Usage Examples
`webpack.config.js`

```js
module.exports = {
  module: {
    rules: [
      {
        test: /target-file.js$/,
        use: [
          {
            loader: `enif-loader`,
            options: {
              context: {
                DEV: process.env.NODE_ENV === 'development'
              }
            }
          },
        ],
      },
    ],
  },
};
```

## What does it look like?

```html
<head>
  <title>Your App</title>

  <!-- #if NODE_ENV='production' -->
  <script src="some/production/lib/like/analytics.js"></script>
  <!-- #endif -->

</head>
<body>
  <!-- #ifdef DEBUG -->
  <h1>Debugging mode - <!-- #echo RELEASE_TAG --> </h1>
  <!-- #endif -->
  <p>
  <!-- #include welcome_message.txt -->
  </p>
</body>
```

```js
var configValue = '/* #echo FOO */' || 'default value';

// #ifdef DEBUG
someDebuggingCall()
// #endif

```

## Directive syntax

### Basic example

The most basic usage is for files that only have two states, non-processed and processed.
In this case, your `#exclude` directives are removed after preprocessing

```html
<body>
    <!-- #exclude -->
    <header>You're on dev!</header>
    <!-- #endexclude -->
</body>
```

After build

```html
<body>
</body>
```

### All directives

 - `#if VAR='value'` / `#endif`
   This will include the enclosed block if your test passes
 - `#ifdef VAR` / `#endif`
   This will include the enclosed block if VAR is defined (typeof !== 'undefined')
 - `#ifndef VAR` / `#endif`
   This will include the enclosed block if VAR is not defined (typeof === 'undefined')
 - `#include`
   This will include the source from an external file. If the included source ends with a newline then the
   following line will be space indented to the level the #include was found.
 - `#include-static`
   Works the same way as `#include` but doesn't process the included file recursively. Is useful if a large
   file has to be included and the recursive processing is not necessary or would otherwise take too long.
 - `#extend file.html` / `#endextend`
   This will use the source from the external file indicated with the `#extend` tag to wrap the enclosed block.
 - `#extendable`
   This tag is used to indicate the location in a file referenced using `#extend` where the block enclosed by `#extend` will be populated.
 - `#exclude` / `#endexclude`
   This will remove the enclosed block upon processing
 - `#echo VAR`
   This will include the environment variable VAR into your source
 - `#foreach $VAR in ARR` / `#endfor`
   This will repeat the enclosed block for each value in the Array or Object in ARR. Each value in ARR can be interpolated into the resulting content with $VAR.
 - `#exec FUNCTION([param1, param2...])`
   This will execute the environment FUNCTION with its parameters and echo the result into your source. The parameter
   could be a string or a reference to another environment variable.

### Extended html Syntax

This is useful for more fine grained control of your files over multiple
environment configurations. You have access to simple tests of any variable within the context (or ENV, if not supplied)

```html
<body>
    <!-- #if NODE_ENV!='production' -->
    <header>You're on dev!</header>
    <!-- #endif -->

    <!-- #if NODE_ENV='production' -->
    <script src="some/production/javascript.js"></script>
    <!-- #endif -->

    <script>
    var fingerprint = '<!-- #echo COMMIT_HASH -->' || 'DEFAULT';
    </script>

    <script src="<!-- #exec static_path('another/production/javascript.js') -->"></script>
</body>
```

With a `NODE_ENV` set to `production` and `0xDEADBEEF` in
`COMMIT_HASH` this will be built to look like

```html
<body>
    <script src="some/production/javascript.js"></script>

    <script>
    var fingerprint = '0xDEADBEEF' || 'DEFAULT';
    </script>

    <script src="http://cdn2.my.domain.com/another/javascript.js"></script>
</body>
```

With NODE_ENV not set or set to dev and nothing in COMMIT_HASH,
the built file will be

```html
<body>
    <header>You're on dev!</header>

    <script>
    var fingerprint = '' || 'DEFAULT';
    </script>

    <script src="http://localhost/myapp/statics/another/javascript.js"></script>
</body>
```

You can also have conditional blocks that are hidden by default by using the
fictional `!>` end tag instead of `-->` after your condition:

```html
<!-- #if true !>
<p>Process was run!</p>
<!-- #endif -->
```

### JavaScript, CSS, C, Java Syntax

Extended syntax below, but will work without specifying a test

```js
normalFunction();
//#exclude
superExpensiveDebugFunction()
//#endexclude

anotherFunction('/* @echo USERNAME */');
```

Built with a NODE_ENV of production :

```js
normalFunction();

anotherFunction('jsoverson');
```

Like HTML, you can have conditional blocks that are hidden by default by ending the directive with a `**` instead of `*/`

```js
angular.module('myModule', ['dep1'
    , 'dep2'
    /* #if NODE_ENV='production' **
    , 'prod_dep'
    /* #endif */
    /* #exclude **
    , 'debug_dep'
    /* #endexclude */
]);

```

_Note: Hidden by default blocks only work with block comments (`/* */`) but not with line comments (`//`)._

CSS example

```css
body {
/* #if NODE_ENV=='development' */
  background-color: red;
/* #endif */

}
// #include util.css
```

(CSS preprocessing supports single line comment style directives)



### Shell, PHP

```bash
#!/bin/bash

# #include util.sh
```

## License

Licensed under the Apache 2.0 license.
