'use strict';

(function(global) {
	var _G = global.grafar;
	
	
	function zeroVector(len) {
		var zero = [];
		for (var i = 0; i < len; i++)
			zero[i] = 0;
		return zero;
	}
	
	function dot(a, b) {
		var temp = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			temp += a[i] * b[i];
		return temp;
	}
	
	function norm(a) {
		var aNorm = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			aNorm += Math.abs(a[i]);
		return aNorm;
	}
	
	function dist(a, b) {
		var abDist = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			abDist += Math.abs(a[i] - b[i]);
		return abDist;
	}

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
	
	
	_G.zeroVector = zeroVector;
	_G.dot = dot;
	_G.norm = norm;
	_G.dist = dist;
	_G.arraySum = arraySum;
	_G.arrayTimes = arrayTimes;
}(this));