'use strict';

Math.pow_old = Math.pow;
Math.pow = function(x, p) {
	var temp = Math.pow_old(x, p);
	if (!isNaN(temp))
		return temp;
		
	temp = -Math.pow_old(-x, p);
	if (Math.abs(Math.pow_old(temp, 1 / p) - x) < .00001)
		return temp;
	
	return NaN;
};

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	
	var vec = {
			VEC_ERROR: new Error('Error: incompatible vector dimensions'),

			norm: function(v, fast) {
				return fast?
					(v.map(Math.abs)).reduce(function(p, c) {return Math.max(p, c)}):
					Math.sqrt(vec.dot(v, v));
			},

			dist: function(p1, p2, fast) {
				if (p1.length != p2.length)
					throw vec.VEC_ERROR;
				return vec.norm(p1.map(function(c, i) {return p1[i] - p2[i]}), fast);
			},

			mid: function(p1, p2) {
				if (p1.length != p2.length)
					throw vec.VEC_ERROR;
				return p1.map(function(c, i) {return (p1[i] + p2[i]) / 2});
			},
			
			triMid: function(p1, p2, p3) {
				if (p1.length != p2.length || p2.length != p3.length)
					throw vec.VEC_ERROR;
				return p1.map(function(c, i) {return (p1[i] + p2[i] + p3[i]) / 3});
			},
			
			t: function(mat) {
				var n = mat.length, m = mat[0].length;
				var result = [];
				for (var i = 0; i < m; i++) {
					result[i] = [];
					for (var j = 0; j < n; j++)
						result[i][j] = mat[j][i].slice();
				}
				return result;
			},
			
			dot: function (v1, v2) {
				if (v1.length !== v2.length)
					throw vec.VEC_ERROR;
				return v1
					.map(function(x, i) {return x * v2[i]})
					.reduce(function(cv, pv) {return cv + pv});
			},
			
			add: function (v1, v2) {
				if (v1.length !== v2.length)
					throw vec.VEC_ERROR;
				return v1.map(function(x, i) {return x + v2[i]});			
			},
			
			times: function(n, v) {
				return v.map(function(x) {return n * x});
			},
			
			solve: function(A, b) {
				// forward
				
				var processed = 0;
				for (var col = 0; col < A[0].length && processed < A.length; col++) {
					var row = processed;
					while (row < A.length && A[row][col] === 0)
						row++;
						
					if (row < A.length) {
						// swap
						A.splice(processed, 0, A.splice(row, 1)[0]);
						for (var row = 0; row < A.length; row++)
							if (row !== processed) // eliminate
								A[row] = vec.add(A[row], vec.times(- A[row][col] / A[processed][col], A[processed]));
							else // normalize
								A[row] = vec.times(1 / A[row][col], A[row]);
					}
					
					processed++;
				}
				
				// backward 
				var pivot = 0, result = [], nonpivots = [], row = 0;
				while (pivot < A[0].length && row < A.length) {
					while (A[row][pivot] === 0 && pivot < A[row].length) {
						result[pivot] = (function() {
							var pivotLoc = pivot;
							return function(freeIndex) {
								return (freeIndex === pivotLoc) + 0;
							}
						}());
						nonpivots.push(pivot);
						pivot++;
					}
					result[pivot] = (function() {
						var temp = A[row];
						return function(freeIndex) {						
							return -temp[freeIndex];
						}
					}());
					pivot++;
					row++;
				}
				while (pivot < A[0].length) {
					result[pivot] = (function() {
						var pivotLoc = pivot;
						return function(freeIndex) {
							return (freeIndex === pivotLoc) + 0;
						}
					}());
					nonpivots.push(pivot);
					pivot++;
				}
				return nonpivots.map(
					function(i) {
						return result.map(function(f) {return f(i)});
					}
				);
			},
			
			isVector: function(a) {
				return typeof(a[0]) === 'number';
			},
			
			proj: function(a, b) {
				return vec.isVector(b)?
					vec.times(vec.dot(a, b) / vec.dot(b, b), b):
					b.reduce(function(pv, cv) {return vec.add(pv, vec.proj(a, cv))}, vec.times(0, a));		
			},
			
			ortho: function(A) {
				var B = [];
				for (var i = 0; i < A.length; i++) {
					B[i] = A[i].slice();
					for (var j = 0; j < i; j++)
						B[i] = vec.add(B[i], vec.times(-1, vec.proj(A[i], B[j])));
					B[i] = vec.times(1 / vec.norm(B[i]), B[i]);
				}
				return B;
			},
			
			cross: function(u, v) {
				return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
			},
			
			angle: function(u, v) {
				return Math.acos(vec.dot(u, v) / (vec.norm(u) * vec.norm(v)));
			}
		};
	
	
	// export
	
	_G.vec = vec;
}(this));