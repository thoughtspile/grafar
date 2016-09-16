import { config } from './config';
import { panels } from './Panel';

export const grafar = {
    version: '4.01r',

    update() {
    	var len = panels.length;
    	for (var i = 0; i < len; i++) {
    		panels[i].update();
        }
    	grafar.frameId++;
    	window.requestAnimationFrame(grafar.update);
    },

    setup(changes, target) {
    	target = target || config;
    	Object.keys(changes).forEach(name => {
    		if (!target.hasOwnProperty(name)) {
                return;
            }
			if (name === 'grafaryaz') {
                grafar.setup(changes[name], config.grafaryaz);
                return;
			}
            target[name] = changes[name];
    	});
    	return grafar;
    },

    config,
    panels,
    frameId: 0
}
