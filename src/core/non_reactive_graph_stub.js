'use strict';

(function(global) {
    // grafar.js
	var grafar = global.grafar;
    // glutils
    var InstanceGL = grafar.InstanceGL;
    var interleave = grafar.interleave;

    var display = function(panel, coords, opts) {
        var instance = new InstanceGL(panel, {r:Math.random(),g:1,b:1});
        var tab = [coords[1], coords[2], coords[0]];
        interleave(tab, instance.position, 3);
		if (opts && opts.edges)
			interleave([opts.edges], instance.segments);
        instance.object.children[0].visible = false;
    };


	grafar.display = display;
}(this));
