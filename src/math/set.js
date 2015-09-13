'use strict';

(function(global) {
	var _G = global.grafar;


	function firstMatch(set, callback) {
		for (var i = 0; i < set.length; i++)
            if (callback(set[i]))
                return set[i];
		return; // undefined
	}

	function haveCommon(arr1, arr2) {
        for (var i = 0; i < arr1.length; i++)
            for (var j = 0; j < arr2.length; j++)
                if (arr1[i] === arr2[j])
                    return true
        return false;
	}

	function intersection(pv, cv, out) {
		return pv.filter(function(e) {
			return cv.indexOf(e) !== -1;
		});
	}

	function interPower(arr1, arr2) {
		var commonCount = 0;
		for (var i = 0; i < arr1.length; i++)
			for (var j = 0; j < arr2.length; j++)
                if (arr1[i] === arr2[j])
                    commonCount++;
		return commonCount;
	}

	function union(a, b, out) {
        out = out || [];
        if (out !== a && out !== b)
            out.length = 0;
        a.reduce(setpush, out);
        b.reduce(setpush, out);
		return out;
	}

    function nunion(sets, out) {
        out = out || [];
        if (sets.indexOf(out) === -1)
            out.length = 0;
        sets.forEach(function(set) {
            union(out, set, out);
        });
		return out;
    };

	function unique(pv, cv) {
		if (pv.indexOf(cv) === -1)
			pv.push(cv);
		return pv;
	}

	function setMinus(arrLeft, arrRight, out) {
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
	_G.nunion = nunion;
	_G.unique = unique;
	_G.setMinus = setMinus;
	_G.setpush = setpush;
	_G.setpop = setpop;
}(this));
