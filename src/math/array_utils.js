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
		
    
	_G.arraySum = arraySum;
	_G.arrayTimes = arrayTimes;
	_G.incArray = incArray;
	_G.timesArray = timesArray;
	_G.repeatArray = repeatArray;
	_G.repeatPoints = repeatPoints;
}(this));