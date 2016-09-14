'use strict';

var _grafar = require('./grafar');

var grafar = _interopRequireWildcard(_grafar);

var _transforms = require('./transforms');

var _bindMixin = require('./bind-mixin');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var N = 1000;

var ctx = {
    clearRect: function clearRect() {},
    fillRect: function fillRect() {}
};
var canvas = {};
if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

// Primitives

var t = grafar.point(0);
var x = grafar.range(0, 500, N);
var i = grafar.ints(-2, 2);

// Unification (should be automated)

var ixt = grafar.cart([i, x, t]);

// Mapping

var y = (0, _bindMixin.bind)(function (i, x, t) {
    return 200 * (1 + Math.sin(t * i + Math.cos(i + x / 20)));
}, ixt);

var graph = grafar.zip([ixt, y]);

// Rendering

var colors = ['#0000ff', '#000088', '#000000', '#880000', '#ff0000'];
var draw = (0, _bindMixin.bind)(function (ixty) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // very bad, can't bind zip for deep arg
    ixty.each(function (i, x, t, y) {
        ctx.fillStyle = colors[i + 2];
        ctx.fillRect(x, y, 1, 1);
    });
}, graph);

// Animate

[
// () => t.setData(t.getData() + .01),
draw].forEach(_bindMixin.Tick.on);