'use strict';

(function(global) {
	var _G = global.grafar;
    

	function arraySum(a, b, out) {
		var l = a.length;
		for (var i = 0; i < l; i++)
			out[i] = a[i] + b[i];
	}

	function arrayTimes(n, b, out) {
		var l = b.length;
		for (var i = 0; i < l; i++)
			out[i] = n * b[i];
	}
    
	function repeatArray(arr, len, times) {
		var buff = arr.subarray(0, len),
			newlen = times * len;
		for (var i = len; i < newlen; i += len)
			arr.set(buff, i);
		return arr;
	}

	function repeatPoints(arr, len, times) {
		for (var i = len - 1, t = len * times - 1; i >= 0; i--) {
			var val = arr[i];
			for (var j = 0; j < times; j++, t--)
				arr[t] = val;
		}
		return arr;
	}
	
    function blockRepeat(source, blockSize, blockCount, repCount, target) {
        if (blockCount > 50) {
            for (var i = blockCount - 1; i >= 0; i--) {
                var baseS = i * blockSize;
                var baseTT = i * repCount;
                for (var k = 0; k < repCount; k++) {
                    var baseT = (baseTT + k) * blockSize;
                    for (var j = 0; j < blockSize; j++)
                        target[baseT + j] = source[baseS + j];
                }
            }
		} else if (blockCount > 10) {
            var buffer = new Float32Array(blockSize);
            for (var i = blockCount - 1; i >= 0; i--) {
                for (var j = 0; j < blockSize; j++)
                    buffer[j] = source[i * blockSize + j];
                var baseT = i * repCount * blockSize;
                for (var k = 0; k < repCount; k++) {
                    target.set(buffer, baseT);
                    baseT += blockSize;
                }
            }
        } else {
            for (var i = blockCount - 1; i >= 0; i--) {
                var buffer = source.subarray(i * blockSize, (i + 1) * blockSize);
                for (var k = 0; k < repCount; k++)
                    target.set(buffer, (i * repCount + k) * blockSize);
            }
        }
    };
    
	function incArray (arr, by) {
		for (var i = 0; i < arr.length; i++)
			arr[i] += by;
		return arr;
	}
	
	function timesArray (n, arr) {
		for (var i = 0; i < arr.length; i++)
			arr[i] *= n;
		return arr;
	}
    
    function Buffer() {
        this.array = new Float32Array(0);
        this.length = 0;
    }
    
    
    _G.Buffer = Buffer;
	_G.arraySum = arraySum;
	_G.arrayTimes = arrayTimes;
	_G.incArray = incArray;
	_G.timesArray = timesArray;
	_G.repeatArray = repeatArray;
	_G.blockRepeat = blockRepeat;
	_G.repeatPoints = repeatPoints;
}(this));