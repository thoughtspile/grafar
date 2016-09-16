"use strict";
var config_1 = require('./config');
var Panel_1 = require('./Panel');
exports.grafar = {
    version: '4.01r',
    update: function () {
        Panel_1.panels.forEach(function (panel) { return panel.update(); });
        exports.grafar.frameId++;
        window.requestAnimationFrame(exports.grafar.update);
    },
    setup: function (changes, target) {
        target = target || config_1.config;
        Object.keys(changes).forEach(function (name) {
            if (!target.hasOwnProperty(name)) {
                return;
            }
            if (name === 'grafaryaz') {
                exports.grafar.setup(changes[name], config_1.config.grafaryaz);
                return;
            }
            target[name] = changes[name];
        });
        return exports.grafar;
    },
    config: config_1.config,
    panels: Panel_1.panels,
    frameId: 0
};
