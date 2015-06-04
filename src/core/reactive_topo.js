'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var pool = _G.pool;
    var incArray = _G.incArray;
    var timesArray = _G.timesArray;
	
    
	function pathGraph(srcDummy, target) {
		var edgeCount = target.pointCount - 1;
        target.buffer(edgeCount * 2);
        var data = target.data;
		for (var i = 0, j = 0; i < edgeCount; i++, j += 2) {
			data[j] = i;
			data[j + 1] = i + 1;
		}
	}
    
	function emptyGraph(srcDummy, target) {
        target.buffer(0);
	}
    
    function cartesianGraphProd(src, target) {
        var arr1 = src[0].value(),
            edgeCount1 = src[0].length / 2,
            nodeCount1 = src[0].nodeCount,
            arr2 = src[1].value(),
            edgeCount2 = src[1].length / 2,
            nodeCount2 = src[1].nodeCount;
        
        // reactive of course these should be!
        target.buffer((edgeCount1 * nodeCount2 + edgeCount2 * nodeCount1) * 2);
        target.nodeCount = nodeCount1 * nodeCount2;
        
        // copies
        var pos = 0;
        var buffer1 = new Uint32Array(arr1);
        console.log(buffer1);
        for (var i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
            target.data.set(buffer1, pos);
            incArray(buffer1, nodeCount1);
        }
        
        var buffer2 = new Uint32Array(arr2);
        timesArray(nodeCount1, buffer2);
        for (var i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
            target.data.set(buffer2, pos);
            incArray(buffer2, 1);
        }
    };
    
    function makeFaces(src, target) {
    };
    
    
    _G.emptyGraph = emptyGraph;
    _G.pathGraph = pathGraph;
    _G.cartesianGraphProd = cartesianGraphProd;
    _G.makeFaces = makeFaces;
}(this));