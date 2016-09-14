import { global } from './contextBusterHack';

(function() {
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

	function norm2(a) {
		var aNorm2 = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			aNorm2 += a[i] * a[i];
		aNorm2 = Math.sqrt(aNorm2);
		return aNorm2;
	}

	function dist(a, b) {
		var abDist = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			abDist += Math.abs(a[i] - b[i]);
		return abDist;
	}


	_G.zeroVector = zeroVector;
	_G.dot = dot;
	_G.norm = norm;
	_G.norm2 = norm2;
	_G.dist = dist;
}(this));'use strict';
