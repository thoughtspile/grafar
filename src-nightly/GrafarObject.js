"use strict";
var utils_1 = require('./utils');
var glUtils_1 = require('./glUtils');
var arrayUtils_1 = require('./arrayUtils');
var topology_1 = require('./topology');
var Style_1 = require('./Style');
var Reactive_1 = require('./Reactive');
var Graph_1 = require('./Graph');
var GrafarObject = (function () {
    function GrafarObject(opts) {
        this.datasets = {};
        this.projections = {};
        this.glinstances = [];
        this.hidden = false;
        this.col = Style_1.Style.randColor();
    }
    GrafarObject.prototype.pin = function (panel) {
        this.glinstances.push(new glUtils_1.InstanceGL(panel, this.col));
        return this;
    };
    GrafarObject.prototype.constrain = function (constraint) {
        var _this = this;
        var names = utils_1.asArray(constraint.what || []);
        var using = utils_1.asArray(constraint.using || []);
        var as = constraint.as || (function () { });
        var maxlen = constraint.maxlen || 40;
        var discrete = constraint.discrete || false;
        var sources = this.project(using, true);
        names.filter(function (name) { return !_this.datasets.hasOwnProperty(name); })
            .forEach(function (name) { _this.datasets[name] = new Graph_1.Graph(); });
        var computation = new Graph_1.Graph();
        computation.data = new Reactive_1.Reactive({
            buffers: names.map(function () { return new arrayUtils_1.Buffer(); }),
            length: 0
        })
            .lift(function (par, out) {
            var data = {};
            using.forEach(function (srcName, i) { data[srcName] = par[i].array; });
            out.length = par.length === 0 ? maxlen : par[0].length;
            for (var i = 0; i < names.length; i++) {
                glUtils_1.resizeBuffer(out.buffers[i], out.length);
                data[names[i]] = out.buffers[i].array;
            }
            as(data, out.length, {});
        })
            .bind(sources.map(function (src) { return src.data; }));
        if (sources.length === 0) {
            computation.edges.data.pointCount = maxlen;
            computation.edges.lift(discrete ? topology_1.emptyGraph : topology_1.pathGraph);
        }
        else {
            computation.edges
                .lift(function (src, targ) {
                targ.pointCount = src[0].pointCount;
                glUtils_1.resizeBuffer(targ, src[0].length);
                targ.array.set(src[0].array);
            })
                .bind(sources.map(function (src) { return src.edges; }));
        }
        computation.base
            .lift(Graph_1.Graph.baseTranslate)
            .bind(sources.map(function (src) { return src.base; }));
        names.forEach(function (name, i) {
            var dataset = _this.datasets[name];
            dataset.base = computation.base;
            dataset.edges = computation.edges;
            dataset.data
                .lift(function (src, target) {
                target.length = src[0].buffers[i].length;
                target.array = src[0].buffers[i].array;
            })
                .bind([computation.data]);
        });
        return this;
    };
    GrafarObject.prototype.colorize = function (args) {
        var _this = this;
        var using = utils_1.asArray(args.using || []);
        var as = args.as || (function () { });
        var data = {};
        using.forEach(function (sourceName) {
            data[sourceName] = _this.datasets[sourceName].data.value().array;
        });
        var buf = this.glinstances[0].color;
        var len = this.project(this.glinstances[0].panel._axes)[0].data.value().length;
        glUtils_1.resizeBuffer(buf, len * 3);
        as(buf.array, data, len);
        return this;
    };
    GrafarObject.prototype.project = function (names, proxy) {
        var _this = this;
        names = utils_1.asArray(names || []);
        var namesHash = names.slice().sort().toString();
        if (!this.projections.hasOwnProperty(namesHash)) {
            var temp = names.map(function (name) {
                if (!_this.datasets.hasOwnProperty(name)) {
                    if (proxy) {
                        _this.datasets[name] = new Graph_1.Graph();
                    }
                    else {
                        throw new Error('cannot select undefined');
                    }
                }
                return _this.datasets[name];
            });
            this.projections[namesHash] = Graph_1.Graph.unify(temp);
        }
        return this.projections[namesHash];
    };
    GrafarObject.prototype.refresh = function () {
        for (var i = 0; i < this.glinstances.length; i++) {
            var instance = this.glinstances[i];
            var tab = this.project(instance.panel._axes, false);
            if (tab.every(function (col) { return col.data.isValid; })) {
                return this;
            }
            glUtils_1.interleave(tab.map(function (c) { return c.data.value(); }), instance.position, 3);
            glUtils_1.interleave([tab[0].edges.value()], instance.segments);
            glUtils_1.interleave([tab[0].faces.value()], instance.faces);
            glUtils_1.resizeBuffer(instance.normals, tab[0].data.value().length * 3);
            instance.object.children[2].geometry.computeVertexNormals();
            var hasEdges = tab[0].edges.value().length > 0;
            var hasFaces = tab[0].faces.value().length > 0;
            instance.object.children[0].visible = !hasEdges && !hasFaces;
        }
        return this;
    };
    GrafarObject.prototype.run = function () {
        var _this = this;
        this.refresh();
        window.requestAnimationFrame(function () { return _this.run(); });
        return this;
    };
    GrafarObject.prototype.hide = function (hide) {
        this.glinstances.forEach(function (instance) { instance.object.visible = !hide; });
        return this;
    };
    GrafarObject.prototype.reset = function () {
        return this;
    };
    return GrafarObject;
}());
exports.GrafarObject = GrafarObject;
