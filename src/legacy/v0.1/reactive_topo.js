'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var pool = _G.pool;
    var incArray = _G.incArray;
    var timesArray = _G.timesArray;
    var resizeBuffer = _G.resizeBuffer;
    var firstMatch = _G.firstMathch;
	
    
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
    
    
    function makeFaces2(src, target) {
        var arr1 = src[0].array,
            edgeCount1 = src[0].length / 2,
            nodeCount1 = src[0].pointCount,
            arr2 = src[1].array,
            edgeCount2 = src[1].length / 2,
            nodeCount2 = src[1].pointCount;
        
        // reactive of course these should be!
        resizeBuffer(target, edgeCount1 * edgeCount2 * 2 * 3);
        var targArray = target.array;
        target.pointCount = nodeCount1 * nodeCount2;
        
        var pos = 0;
        var buffer1 = new Uint32Array(arr1);
        for (var i = 0; i < edgeCount1; i++) {
            for (var j = 0; j < edgeCount2; j++) {
                var e1from = arr1[2 * i];
                var e1to = arr1[2 * i + 1];
                var e2from = arr2[2 * j];
                var e2to = arr2[2 * j + 1];
                
				targArray[pos] = e1from + e2from  * nodeCount1;
				targArray[pos + 1] = e1from + e2to  * nodeCount1;
				targArray[pos + 2] = e1to + e2to  * nodeCount1;
				pos += 3;
				
				targArray[pos] = e1from + e2from  * nodeCount1;
				targArray[pos + 1] = e1to + e2to  * nodeCount1;
				targArray[pos + 2] = e1to + e2from  * nodeCount1;
				pos += 3;
            }
        }
    }
    
    function makeFaces(src, target) {
        // leads to wild results for non-2D objects
        var nonEmpty = src.filter(function(src) { return src.length !== 0; });
        if (nonEmpty.length !== 2) {
            resizeBuffer(target, 0);
            return;
        }
        var leftStretch = src.slice(0, src.indexOf(nonEmpty[0]))
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
        var midStretch = src.slice(src.indexOf(nonEmpty[0]) + 1, src.indexOf(nonEmpty[1]))
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
        var rightStretch = src.slice(src.indexOf(nonEmpty[1]) + 1)
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
            
        var accum = {
            array: new Uint32Array(0),
            pointCount: leftStretch,
            length: 0
        };
        
        var edgeCount1 = nonEmpty[0].length / 2;
        var nodeCount1 = nonEmpty[0].pointCount;
        var buffer = new Uint32Array(nonEmpty[0].array);
        
        resizeBuffer(accum, edgeCount1 * leftStretch * 2);
        accum.pointCount = leftStretch * nodeCount1;
        
        timesArray(leftStretch, buffer);
        for (var i = 0, pos = 0; i < leftStretch; i++, pos += 2 * edgeCount1) {
            accum.array.set(buffer, pos);
            incArray(buffer, 1);
        }
        
        edgeCount1 = accum.length / 2;
        nodeCount1 = accum.pointCount;
        buffer = new Uint32Array(accum.array);
        
        resizeBuffer(accum, edgeCount1 * midStretch * 2);
        accum.pointCount = midStretch * nodeCount1;
        
        for (var i = 0, pos = 0; i < midStretch; i++, pos += 2 * edgeCount1) {
            accum.array.set(buffer, pos);
            incArray(buffer, nodeCount1);
        }
        
        makeFaces2([accum, nonEmpty[1]], accum);
        
        if (rightStretch !== 1) {
            var rightPad = {
                array: new Uint32Array(0),
                pointCount: rightStretch,
                length: 0
            };
            cartesianGraphProd([accum, rightPad], accum)
        }
        
        resizeBuffer(target, accum.length);
        target.array.set(accum.array);
        target.pointCount = accum.pointCount;
    };
    
    
    _G.emptyGraph = emptyGraph;
    _G.pathGraph = pathGraph;
    _G.cartesianGraphProd = cartesianGraphProd;
    _G.makeFaces = makeFaces;
}(this));