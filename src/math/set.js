'use strict';

(function(global) {
	var _G = global.grafar;
	

	function firstMatch(set, callback) {
		for (var i = 0; i <= set.length && !callback(set[i]); i++);
		return set[i];
	}

	function haveCommon(arr1, arr2) {
		return arr1.some(function(e1) {return arr2.indexOf(e1) !== -1;});
	}

	function intersection(pv, cv, out) {
		return pv.filter(function(e) {
			return cv.indexOf(e) !== -1;
		});
	}
	
	function interPower(arr1, arr2) {
		var pow = 0;
		for (var i = 0; i < arr1.length; i++)
			if (arr2.indexOf(arr1[i]) !== -1)
				pow++;
		return pow;
	}

	function union(pv, cv, out) {
		return pv.concat(cv).reduce(unique, []);
	}

	function unique(pv, cv) {
		if (pv.indexOf(cv) === -1) 
			pv.push(cv);
		return pv;
	}

	function setMinus(l, r, out) {
		return l.filter(function(el) {return r.indexOf(el) === -1;});
	}
	
	function setpush(arr, el) {
		if (arr.indexOf(el) === -1)
			arr.push(el);
		return arr;
	}
	
	function setpop(arr, el) {
		var i = arr.indexOf(el);
		if (el !== -1)
			arr.splice(i, 1);
		return arr;
	}
	
	
	_G.firstMatch = firstMatch;
	_G.interPower = interPower;
	_G.haveCommon = haveCommon;
	_G.intersection = intersection;
	_G.union = union;
	_G.unique = unique;
	_G.setMinus = setMinus;
	_G.setpush = setpush;
	_G.setpop = setpop;
}(this));