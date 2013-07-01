# delve.js

Delve.js is a small utility for making navigation and dereferencing of large and complex JavaScript object trees safer, more terse, and a little more semantic.  It's not quite as good as having a real "safe dereference" operator, but it can make your code, which deals with large nested objects, much more readable.  Especially if it has a non-guaranteed structure, and any property that you expect can be missing.

Instead of something like this:

    `window.namespace && window.namespace.feature && window.namespace.feature[0] && window.namespace.feature[0].description`
You can use this:

    `delve( window.namespace )( 'feature' )( 0 )( 'description' )()`
## How to use delve.js
Use your favorite method for including delve.js, be it require/AMD or just using a script tag in the browser.  Call the public/exported function "delve", with the object that you wish to search within as the parameter.

## The API, in brief.
* `delve( source )`: Given an object or array, delve will return a function.  Let's call this function "inspect".  Note that there is no actual function named "inspect".  We're just using it as a shorthand to refer to any function returned by delve.
* `inspect()`: When passed no arguments, inspect will return its "source" value.
* `inspect( ask )`: When passed an argument, inspect will return a new inspect function, using the argument to dereference the key you asked for, and making that value the new "source" for this inspect function.  If, at any point, the new source is undefined, then any call to an inspect function will result in a new inspect function, whose source is undefined.
    * When passed a string or a number (integer), inspect will dereference the key on the source object, and make that value the new source.  Using dots in the string to dereference multiple levels at once is not supported, nor expected.
    * When passed an object, inspect will assume that the source is an array (or box it in an array, if it isn't), find the first object within that array that matches the key(s) and value(s) in the passed object, and make that value the new source of the returned inspect function.  If it does not find an object where those keys and values are present together, then the source will be undefined.  This is best shown by example:

        ```javascript
        delve( [{ color: 'red', shape: 'square'}, { color: 'blue', shape: 'triangle' }, { color: 'green', shape: 'circle' }] )( { color: 'blue' } )();
        // Returns { color: 'blue', shape: 'triangle' }
        ```
    * When passed a function, the inspect function will execute the passed function, using the source as the first and only parameter, and use its return value as the parameter for finding what to dereference and use for the next source.  You shouldn't need this very often.  It's intended for very strange or complex cases, where simple strings and objects aren't enough to figure out what to find.
    * When passed an array, the inspect function will treat the items in the array as an "or", using each value in the array (string, number, object, or function), in order, to look for what to dereference and use as the source for the next inspect function. 
Looking at the included test spec should help illustrate how each of these options works.

This software is made available under the terms of the MIT License.  http://opensource.org/licenses/MIT