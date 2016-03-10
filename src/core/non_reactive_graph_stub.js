var glutils = require('./glutils.js');
var InstanceGL = glutils.InstanceGL;
var interleave = glutils.interleave;

var animate = require('./misc.js').animate;


var display = function(panel, coords, opts) {
	var opts = opts || {};
	var color = opts.color || {r: Math.random(), g: 1, b: 1};
    var instance = opts.instance || new InstanceGL(panel, color);
    var tab = [coords[1], coords[2], coords[0]];

    interleave(tab, instance.position, 3);
	if (opts && opts.edges) {
		interleave([opts.edges], instance.segments);
    	instance.object.children[0].visible = false;
	}

	return instance;
};

var bindDisplay = function(panel, coords, opts) {
	opts = opts || {};
	opts.instance = display(panel, coords, opts);
	grafar.animate(function() {
		display(panel, coords, opts);
		return true;
	});
	return grafar;
};

module.exports = {
	bindDisplay: bindDisplay,
	display: display
};
