import { config } from './config/config'
import { Panel } from './core/panel';
import { Reactive } from './core/reactive';

var global = window;

// Singleton API interface
var grafar = function(value) {
    return new grafar.Reactive(function() { return value; });
};
grafar.version = '4.02a';
grafar.config = config;

grafar.frameId = 0;
grafar.panels = Panel.panels;
grafar.Panel = Panel;

grafar.Reactive = Reactive;

grafar.update = function update() {
	var len = grafar.panels.length;
	for (var i = 0; i < len; i++) {
		grafar.panels[i].update();
	}
	grafar.frameId++;
	global.requestAnimationFrame(grafar.update);
	return grafar;
};

grafar.setup = function setup(changes, target) {
	target = target || config;
	Object.keys(changes).forEach(function(name) {
		if (target.hasOwnProperty(name)) {
			if (name !== 'grafaryaz') {
				target[name] = changes[name];
			} else {
				grafar.setup(changes[name], config.grafaryaz);
			}
		}
	});
	return grafar;
};

// bootstrap
grafar.update();

global.grafar = grafar;

export { grafar }
