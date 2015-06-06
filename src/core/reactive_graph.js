'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var emptyGraph = _G.emptyGraph;
    var pathGraph = _G.pathGraph;
    var cartesianGraphProd = _G.cartesianGraphProd;
    var makeFaces = _G.makeFaces;
    var Buffer = _G.Buffer;
    var resizeBuffer = _G.resizeBuffer;
    var nunion = _G.nunion;
    var blockRepeat = _G.blockRepeat;
	
    
	function Graph() {
        this.data = new Reactive(new Buffer());
        this.edges = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.faces = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.base = new Reactive({parent: this, struct: []});
	};
    
    
    var baseOrder = [],
        baseComparator = function(a, b) {
            return baseOrder.indexOf(a) >= baseOrder.indexOf(b);
        };
    
    Graph.contextify = function(col, targetBase) {
        var temp = new Graph();
        temp.base = targetBase;
        temp.data.lift(function(par, out) {
            var data = par[0],
                colBase = par[1].struct,
                targetBase = par[2].struct,
                totalLength = targetBase.reduce(function(pv, cv) {
                    return pv * cv.data.value().length;
                }, 1),
                blockSize = 1,
                len = data.length;
            resizeBuffer(out, totalLength);
            var res = out.array;
            res.set(data.array);
            for (var i = 0; i < targetBase.length; i++) {
                if (colBase.indexOf(targetBase[i]) === -1) {
                    blockRepeat(
                        res, 
                        blockSize, 
                        Math.floor(len / blockSize),
                        targetBase[i].data.value().length,
                        res
                    );
                    len *= targetBase[i].data.value().length;
                }
                blockSize *= targetBase[i].data.value().length;
            }
        }).bind([col.data, col.base, temp.base]);
        return temp;
    };
    
    Graph.unify = function(cols) {
        var targetBase = new Reactive({
                parent: null,
                struct: []
            })
            .lift(Graph.baseTranslate)
            .bind(cols.map(function(col) {
                return col.base;
            }));
        var baseEdges = new Reactive([])
            .lift(function(src, targ) {
                return src[0].struct.map(function(base) {
                    return base.edges.value();
                });
            })
            .bind([targetBase]);
        var targetEdges = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift(function(arr, targ) {
                cartesianGraphProd(arr[0], targ);
            })
            .bind([baseEdges]);
        var targetFaces = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift(function(arr, targ) {
                makeFaces(arr[0], targ);
            })
            .bind([baseEdges]);
        return cols.map(function(col) {
            var unified = Graph.contextify(col, targetBase);
            unified.edges = targetEdges;
            unified.faces = targetFaces;
            return unified;
        });
    };
    
    Graph.baseTranslate = function(src, self) {
        if (src.length === 0) {
            baseOrder.push(self.parent);
            self.struct = [self.parent];
        } else {
            nunion(src.map(function(b) {
                return b.struct;
            }), self.struct);
            self.struct.sort(baseComparator);
        }
    };
    
    
	_G.GraphR = Graph;
}(this));