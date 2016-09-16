"use strict";
var glUtils_1 = require('./glUtils');
var arrayUtils_1 = require('./arrayUtils');
var topology_1 = require('./topology');
var setUtils_1 = require('./setUtils');
var Reactive_1 = require('./Reactive');
var baseOrder = [];
var baseComparator = function (a, b) { return baseOrder.indexOf(a) >= baseOrder.indexOf(b); };
var Graph = (function () {
    function Graph() {
        this.data = new Reactive_1.Reactive(new arrayUtils_1.Buffer());
        this.edges = new Reactive_1.Reactive({ array: new Uint32Array(0), length: 0 });
        this.faces = new Reactive_1.Reactive({ array: new Uint32Array(0), length: 0 });
        this.colors = new Reactive_1.Reactive({ array: new Float32Array(0), length: 0 });
        this.base = new Reactive_1.Reactive({ parent: this, struct: [] });
    }
    Graph.contextify = function (col, targetBase) {
        var temp = new Graph();
        temp.base = targetBase;
        temp.data.lift(function (par, out) {
            var data = par[0];
            var colBase = par[1].struct;
            var targetBase = par[2].struct;
            var totalLength = targetBase
                .map(function (item) { return item.data.value().length; })
                .reduce(function (prod, len) { return prod * len; }, 1);
            var blockSize = 1;
            var len = data.length;
            glUtils_1.resizeBuffer(out, totalLength);
            var res = out.array;
            res.set(data.array);
            targetBase.forEach(function (base) {
                if (colBase.indexOf(base) === -1) {
                    arrayUtils_1.blockRepeat(res, blockSize, Math.floor(len / blockSize), base.data.value().length, res);
                    len *= base.data.value().length;
                }
                blockSize *= base.data.value().length;
            });
        }).bind([col.data, col.base, temp.base]);
        return temp;
    };
    Graph.unify = function (cols) {
        var targetBase = new Reactive_1.Reactive({ parent: null, struct: [] })
            .lift(Graph.baseTranslate)
            .bind(cols.map(function (col) { return col.base; }));
        var baseEdges = new Reactive_1.Reactive([])
            .lift(function (src, targ) { return src[0].struct.map(function (base) { return base.edges.value(); }); })
            .bind([targetBase]);
        var targetEdges = new Reactive_1.Reactive({ array: new Uint32Array(0), length: 0 })
            .lift(function (arr, targ) { return topology_1.cartesianGraphProd(arr[0], targ); })
            .bind([baseEdges]);
        var targetFaces = new Reactive_1.Reactive({ array: new Uint32Array(0), length: 0 })
            .lift(function (arr, targ) { return topology_1.makeFaces(arr[0], targ); })
            .bind([baseEdges]);
        return cols.map(function (col) {
            var unified = Graph.contextify(col, targetBase);
            unified.edges = targetEdges;
            unified.faces = targetFaces;
            return unified;
        });
    };
    Graph.baseTranslate = function (src, self) {
        if (src.length === 0) {
            baseOrder.push(self.parent);
            self.struct = [self.parent];
        }
        else {
            setUtils_1.nunion(src.map(function (b) { return b.struct; }), self.struct);
            self.struct.sort(baseComparator);
        }
    };
    return Graph;
}());
exports.Graph = Graph;
