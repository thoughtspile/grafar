import { config } from './config';
import { panels } from './Panel';

const global = window;

var grafar = {
    version: '4.01r'
};

var update = function() {
	var len = panels.length;
	for (var i = 0; i < len; i++)
		panels[i].update();
	grafar.frameId++;
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
	return grafar;
}

grafar.config = config;
grafar.panels = panels;
grafar.update = update;
grafar.setup = setup;
grafar.frameId = 0;

update();

export { grafar };
