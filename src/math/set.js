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

	function intersection(pv, cv) {
		return pv.filter(function(e) {
			return cv.indexOf(e) !== -1;
		});
	}

	function union(pv, cv) {
		return pv.concat(cv).reduce(unique, []);
	}

	function unique(pv, cv) {
		if (pv.indexOf(cv) === -1) 
			pv.push(cv);
		return pv;
	}

	function setMinus(l, r) {
		return l.filter(function(el) {return r.indexOf(el) === -1;});
	}
	
	
	_G.firstMatch = firstMatch;
	_G.haveCommon = haveCommon;
	_G.intersection = intersection;
	_G.union = union;
	_G.unique = unique;
	_G.setMinus = setMinus;
}(this));