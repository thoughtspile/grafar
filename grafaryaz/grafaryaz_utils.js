'use strict';

(function(global) {
	var _GY = global.grafaryaz || (global.grafaryaz = {});
	
	var config = _GY.config; // nope

	// numerics

	var diffStep = 0.001, tol = 0.001;

	function pow (x, p) {
		var temp = Math.pow(x, p);
		if (!isNaN(temp))
			return temp;
			
		temp = -Math.pow(-x, p);
		if (Math.abs(Math.pow(temp, 1 / p) - x) < .00001)
			return temp;
		
		return NaN;
	};
	
	function seq(a, b, name) {
		a = Number(a);
		b = Number(b);
		return function(data, l) {
			var step = (b - a) / (l - 1);
			for (var i = 0; i < l ; i++)
				data[name][i] = a + i * step;
		}
	}
		
	function traceZeroSet(f, names) {
		var dof = names.length,
			gradf = grad(f);
			//targetCount = Math.pow(_GY.config.samplesPerDOF, dof);
		return function(data, l) {
			var res = [];
				
			for (var i = 0; i < l; i++) {
				var start = [];
				for (var j = 0; j < dof; j++) // should make no assumptions
					start[j] = -2 + 4 * Math.random();
				res.push(newton(start, f, gradf, false));
			}
			
			res.forEach(function(row, i) {
				names.forEach(function(name, j) {
					data[name][i] = row[j];
				});
			});
		}
	}

	function PD(fa, overI) {
		return function(pt) {
			var fc = fa(pt),
				alt = pt.slice();
			alt[overI] += diffStep;
			return (fa(alt) - fc) / diffStep;
		};
	}

	function grad(fa) {
		return function(pt) {
			var fc = fa(pt);
			return pt.map(function(targ, i) {
				var alt = pt.slice();
				alt[i] += diffStep;
				return (fa(alt) - fc) / diffStep;
			});
		};
	}

	function newton(start, f, gradf, acceptNeg) {
		var prev = [],
			next = start,
			i = 0;
		do {
			prev = next;
			var nabla = gradf(prev),
				val = f(prev);
			if (acceptNeg && val <= 0) 
				return prev;
			next = arraySum(prev, arrayTimes(-val / dot(nabla, nabla), nabla));
			i++;
		} while (dist(prev, next) > tol && i < 100 && val !== 0);
		return next;
	}

	
	// sets

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

	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
	// linear algebra

	function dot(a, b) {
		return a.map(function(ai ,i) {
				return ai * b[i];
			}).reduce(function(pv, cv) {
				return pv + cv;
			}, 0);
	}
	
	function norm(a) {
		return dist(a, a.map(function() {return 0;}));
	}
	
	function dist(a, b) {
		return a.map(function(ai, i) {return Math.abs(ai - b[i]);}).reduce(function(pv, cv) {return pv+cv;}, 0);
	}

	function arraySum(a, b) {
		return a.map(function(ai, i) {
				return ai + b[i];
			});
	}

	function arrayTimes(n, b) {
		return b.map(function(bi) {return n * bi;});
	}
	
	
	// exports
	
	_GY.seq = seq;
	_GY.traceZeroSet = traceZeroSet;
	_GY.pow = pow;
		
	// these should be in a Set object or something
	_GY.firstMatch = firstMatch;
	_GY.haveCommon = haveCommon;
	_GY.intersection = intersection;
	_GY.union = union;
	_GY.unique = unique;
	_GY.setMinus = setMinus;
	_GY.isExisty = isExisty;
}(this));