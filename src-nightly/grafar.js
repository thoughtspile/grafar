"use strict";
var api_1 = require('./api');
var Style_1 = require('./Style');
var Panel_1 = require('./Panel');
var GrafarObject_1 = require('./GrafarObject');
var generators = require('./generators');
api_1.grafar['Style'] = Style_1.Style;
api_1.grafar['Panel'] = Panel_1.Panel;
api_1.grafar['Object'] = GrafarObject_1.GrafarObject;
Object.keys(generators).forEach(function (key) {
    api_1.grafar[key] = generators[key];
});
api_1.grafar.update();
window['grafar'] = api_1.grafar;
