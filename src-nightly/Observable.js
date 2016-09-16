"use strict";
var utils_1 = require('./utils');
var objects = {};
var Observable = (function () {
    function Observable() {
        this.handlers = {};
        var id = utils_1.makeID(objects);
        objects[id] = true;
        this.id = id;
    }
    Observable.prototype.on = function (event, handler) {
        if (!utils_1.isExisty(this.handlers[event])) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
        return this;
    };
    Observable.prototype.off = function (event, handler) {
        var handlers = this.handlers[event];
        if (utils_1.isExisty(handlers)) {
            var index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
        return this;
    };
    Observable.prototype.dispatch = function (event) {
        (this.handlers[event] || []).forEach(function (handle) { return handle(); });
        return this;
    };
    return Observable;
}());
exports.Observable = Observable;
