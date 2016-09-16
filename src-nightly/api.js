import { config } from './config';
import { panels } from './Panel';

export const grafar = {
    version: '4.01r',

    update: function() {
    	var len = panels.length;
    	for (var i = 0; i < len; i++) {
    		panels[i].update();
        }
    	grafar.frameId++;
    	window.requestAnimationFrame(grafar.update);
    },

    setup: function(changes, target) {
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
    },

    config,
    panels,
    frameId: 0
}
