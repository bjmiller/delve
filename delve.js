/*global define:false */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.delve = factory();
  }
})(this, function () {
  var isUndefined, isObj, isArray, isNoArg, delve, generateInspector, nothing, inspect, dereference;
  
  isUndefined = function(thing) {
    return (typeof thing === 'undefined'); 
  };
  
  isArray = function(thing) {
    return (Object.prototype.toString.call(thing) === '[object Array]');
  };

  isArguments = function(thing) {
    return (Object.prototype.toString.call(thing) === '[object Arguments]') || thing.hasOwnProperty('callee');
  };
  
  // Kind of borrowing jQuery's "isPlainObject".
  isObj = function(thing) {
    try {
      return (Object.prototype.toString.call(thing) !== '[object Object]' || thing.nodeType || thing === thing.window || (thing.constructor && !Object.prototype.hasOwnProperty.call(thing.constructor.prototype, "isPrototypeOf"))) ? false : true; 
    } catch (e) {
      return false;
    }
  };
  
  isNoArg = function(thing) {
    return (isArguments(thing) || isArray(thing)) && isUndefined(thing[0]) && thing.length === 0;
  };
  
  delve = function(source) {
    return generateInspector(source);
  };
  
  generateInspector = function(/* source */) {
    var argv, source;
    argv = [].slice.call(arguments);
    if (isUndefined(argv[0])) {
      return nothing();
    } else {
      return function() {
        source = argv[0];
        return inspect.apply(this, [source].concat([].slice.call(arguments)));
      };
    }
  };
  
  nothing = function() {
    return function() {
      if (isNoArg(arguments)) {
        return void(0);
      } else {
        return nothing;
      }
    };
  };
  
  dereference = {
    string: function(source, ask) {
      return source[ask];
    },
    number: function(source, ask) {
      if (isArray(source)) {
        if (ask >= 0 && ask < source.length) {
          return source[ask];
        } else {
          return void 0;
        }
      } else if (ask === 0) { // This addresses a specific corner case, where an XML-JSON serializer represents a single child element as a non-array, but represents multiple child elements as an array.
        return source;
      } else {
        return void 0;
      }
    },
    object: function(source, ask) {
      var sourceArray, toFind, prop, i, j, k, meetsCriteria, results;
      sourceArray = isArray(source) ? source : [source];
      toFind = [];
      for (prop in ask) {
        if (ask.hasOwnProperty(prop)) {
          toFind.push(prop);
        }
      }
      results = [];
      for (i = 0; i < sourceArray.length; i++) {
        for (j = 0; j < toFind.length; j++) {
          if (isArray(ask[toFind[j]])) {
            for (k = 0; k < ask[toFind[j]].length; k++) {
              meetsCriteria = meetsCriteria || (sourceArray[i][toFind[j]] === ask[toFind[j]][k]);
            }
          } else {
            meetsCriteria = (sourceArray[i][toFind[j]] === ask[toFind[j]]);
          }
          if (!meetsCriteria) {
            break;
          }
        }
        if (meetsCriteria) {
          results.push(sourceArray[i]);
          meetsCriteria = false;
          return sourceArray[i];
        }
      }
      return results.length === 0 ? void 0 : results[0];
    }
  };
  
  inspect = function(/* source, ask */) {
    var argv, ask, source, newSource, i, interim;
    argv = [].slice.call(arguments);
    source = argv[0];
    ask = typeof (argv[1]) === 'function' ? argv[1](source) : argv[1];
    // If ask is...
    //   a string - dereference by property, and return updated inspector
    //   an object - do an "array find"
    //   a number - dereference by array.
    //   an array
    //   a function
    //   no args - return the value of source
    if (isUndefined(source)) {
      return generateInspector(void 0);
    } else if (isNoArg(argv.slice(1))) {
      return source;
    } else if (typeof ask === 'string') {
      return generateInspector(dereference.string(source, ask));
    } else if (typeof ask === 'number') {
      return generateInspector(dereference.number(source, ask));
    } else if (isObj(ask)) {
      return generateInspector(dereference.object(source, ask));
    } else if (isArray(ask)) {
      for (i = 0; i < ask.length; i++) {
        interim = inspect(source, ask[i]);
        if (!isUndefined(interim())) {
          return generateInspector(interim());
        }
      }
    } else {
      return generateInspector(void 0);
    }
  };
  
  return delve;
});
