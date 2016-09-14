import { global } from './contextBusterHack';
import { config } from './config';

var _G = (global.grafar = {
        version: '4.01r'
    });
var panels = [];


var update = function() {
	var len = panels.length;
	for (var i = 0; i < len; i++)
		panels[i].update();
	_G.frameId++;
	global.requestAnimationFrame(update);
};

function setup(changes, target) {
	target = target || config;
	Object.keys(changes).forEach(function(name) {
		if (target.hasOwnProperty(name))
			if (name !== 'grafaryaz')
				target[name] = changes[name];
			else
				setup(changes[name], config.grafaryaz);
	});
	return _G;
}


// export

_G.config = config;
_G.panels = panels;
_G.update = update;
_G.setup = setup;
_G.frameId = 0;

update();
