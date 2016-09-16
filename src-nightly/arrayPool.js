"use strict";
var utils_1 = require('./utils');
exports.pool = {
    pool: {},
    get: function (Constructor, length) {
        var classKey = Constructor.toString();
        var constructorKey = length.toString();
        var classPool = this.pool[classKey];
        if (utils_1.isExisty(classPool) && utils_1.isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0) {
            return classPool[constructorKey].pop();
        }
        return new Constructor(length);
    },
    push: function (obj) {
        var classKey = obj.constructor.toString();
        var constructorKey = obj.length.toString();
        if (!utils_1.isExisty(this.pool[classKey])) {
            this.pool[classKey] = {};
        }
        if (!utils_1.isExisty(this.pool[classKey][constructorKey])) {
            this.pool[classKey][constructorKey] = [];
        }
        this.pool[classKey][constructorKey].push(obj);
    },
    flush: function () {
        this.pool = {};
    }
};
