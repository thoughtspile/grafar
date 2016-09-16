"use strict";
var utils_1 = require('./utils');
var setUtils_1 = require('./setUtils');
var Reactive = (function () {
    function Reactive(data) {
        if (data === void 0) { data = {}; }
        this.data = data;
        this.fn = function () { };
        this.isValid = false;
        this.sources = [];
        this.targets = [];
    }
    Reactive.prototype.isReactive = function (obj) {
        return obj instanceof Reactive;
    };
    Reactive.prototype.push = function () {
        return this;
    };
    Reactive.prototype.lift = function (fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    };
    Reactive.prototype.bind = function (newArgs) {
        var _this = this;
        this.unbind();
        newArgs.forEach(function (arg) { return setUtils_1.setpush(arg.targets, _this); });
        this.sources = newArgs.slice();
        return this;
    };
    Reactive.prototype.unbind = function () {
        var _this = this;
        this.sources.forEach(function (src) { return setUtils_1.setpop(src.targets, _this); });
        this.sources.length = 0;
        this.invalidate();
        return this;
    };
    Reactive.prototype.validate = function () {
        if (!this.isValid) {
            var sourceData = this.sources.map(function (src) { return src.value(); });
            var res = this.fn(sourceData, this.data);
            if (utils_1.isExisty(res)) {
                this.data = res;
            }
            this.isValid = true;
        }
        return this;
    };
    Reactive.prototype.invalidate = function () {
        this.isValid = false;
        this.targets
            .filter(function (targ) { return targ.isValid; })
            .forEach(function (targ) { return targ.invalidate(); });
        return this;
    };
    Reactive.prototype.value = function () {
        return this.validate().data;
    };
    return Reactive;
}());
exports.Reactive = Reactive;
