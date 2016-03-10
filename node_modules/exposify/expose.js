'use strict';

var detective = require('detective')
  , hasRequire = require('has-require');

function rangeComparator(a, b) {
  return a.from > b.from ? 1 : -1;
}

function getReplacements(id, globalVar, requires) {
  if (!~requires.strings.indexOf(id)) return [];

  var ranges = requires.strings
    .reduce(function (acc, s, index) {
      var node;
      if (s === id) { 
        node = requires.nodes[index]
        acc.push({ from: node.range[0], to: node.range[1], id: id, code: '(window.' + globalVar  + ')' });
      }
      return acc;
    }, [])

  return ranges;
}

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

var go = module.exports = 

/**
 * Replaces each require statement for ids found in the map with an assignment to the global value.
 *
 * @name expose
 * @private
 * @function
 * @param {Object.<string, string>} map maps module names to the global under which they are actually exposed
 * @param {string} origSrc the original source
 * @return {string} source with globals exposed
 */
function expose(map, origSrc) {
  var regex, keys, id;
  var src = origSrc;

  keys = Object.keys(map);

  // ensure that at least one of the require statements we want to replace is in the code
  // before we perform the expensive operation of finding them by creating an AST
  var requireChecker = new hasRequire.Checker(src);
  var hasMatchingRequires = keys.some(requireChecker.has, requireChecker);
  if (!hasMatchingRequires) return src;

  var requires = detective.find(src, { nodes: true, parse: { range: true } });
  if (!requires.strings.length) return src;

  var replacements = keys
    .reduce(function (acc, id) {
      var r = getReplacements(id, map[id], requires);
      return acc.concat(r);
    }, [])
    .sort(rangeComparator);

  var offset = 0;
  return replacements
    .reduce(function(acc, replacement) {
      var from = replacement.from + offset
        , to   = replacement.to + offset
        , code = replacement.code;

      // all ranges will be invalidated since we are changing the code
      // therefore keep track of the offset to adjust them in case we replace multiple requires
      var diff = code.length - (to - from);
      offset += diff;
      return acc.slice(0, from) + code + acc.slice(to);
    }, src);
}
