'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var pool = _G.pool;
    var incArray = _G.incArray;
    var timesArray = _G.timesArray;
    var resizeBuffer = _G.resizeBuffer;
	
    
	function pathGraph(srcDummy, target) {
		var edgeCount = target.pointCount - 1;
        resizeBuffer(target, edgeCount * 2);
        var data = target.array;
		for (var i = 0, j = 0; i < edgeCount; i++, j += 2) {
			data[j] = i;
			data[j + 1] = i + 1;
		}
	}
    
	function emptyGraph(srcDummy, target) {
        resizeBuffer(target, 0);
	}
    
    function cartesianGraphProd2(src, target) {
        var arr1 = src[0].array,
            edgeCount1 = src[0].length / 2,
            nodeCount1 = src[0].pointCount,
            arr2 = src[1].array,
            edgeCount2 = src[1].length / 2,
            nodeCount2 = src[1].pointCount;
        
        // reactive of course these should be!
        resizeBuffer(target, (edgeCount1 * nodeCount2 + edgeCount2 * nodeCount1) * 2);
        target.pointCount = nodeCount1 * nodeCount2;
        
        var pos = 0;
        var buffer1 = new Uint32Array(arr1);
        for (var i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
            target.array.set(buffer1, pos);
            incArray(buffer1, nodeCount1);
        }
        
        var buffer2 = new Uint32Array(arr2);
        timesArray(nodeCount1, buffer2);
        for (var i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
            target.array.set(buffer2, pos);
            incArray(buffer2, 1);
        }
    };
    
    function cartesianGraphProdN(src, target) {
        var totalEdgeCount = 0;
        var totalNodeCount = 1;
        for (var i = 0; i < src.length; i++) {
            var accum = src[i].length / 2;
            for (var j = 0; j < src.length; j++)
                if (i !== j)
                    accum *= src[j].nodeCount;
            totalEdgeCount += accum;
            totalNodeCount *= src[i].nodeCount;
        }
        target.buffer(totalEdgeCount * 2);
        target.nodeCount = totalNodeCount;
        
        var edgeCounter = 0;
        var nodeCounter = 1;
        var targetArray = target.array;
        for (var i = 0; i < src.length; i++) {
            var factor = src[i].value(),
                factorEdgeCount = src[i].length / 2,
                factorNodeCount = src[i].nodeCount;
            
            var buffer1 = new Uint32Array(arr1);//
            for (var i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
                targetArray.set(buffer1, pos);
                incArray(buffer1, nodeCount1);
            }
            
            var buffer2 = new Uint32Array(arr2);
            timesArray(nodeCount1, buffer2);
            for (var i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
                targetArray.set(buffer2, pos);
                incArray(buffer2, 1);
            }
        }
    };
    
    function cartesianGraphProd(src, target) {
        // this is a disgusting, leaky implementation
        var accum = {
            array: new Uint32Array(0),
            pointCount: 1,
            length: 0
        };
        for (var i = 0; i < src.length; i++)
            cartesianGraphProd2([accum, src[i]], accum);
        resizeBuffer(target, accum.length);
        target.array.set(accum.array);
        target.pointCount = accum.pointCount;
    };
    
    function makeFaces(src, target) {
    };
    
    
    _G.emptyGraph = emptyGraph;
    _G.pathGraph = pathGraph;
    _G.cartesianGraphProd = cartesianGraphProd;
    _G.makeFaces = makeFaces;
}(this));