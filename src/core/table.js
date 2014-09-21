'use strict';
	
(function(global) {
	var _G = global.grafar,
		isExisty = _G.isExisty;
	
		
	function Table2(opts) {
		opts = opts || {};
	
		this.data = {};		
		this.length = 1;
		this.capacity = opts.capacity || 1;
		
		this.gDesc = '';
	}
	
	// misc
	Table2.prototype.schema = function() {
		return Object.getOwnPropertyNames(this.data);
	};
	
	Table2.prototype.setLength = function(newLength) {
		this.extend(newLength);
		this.length = newLength;
		return this;
	};
	
	Table2.prototype.extend = function(newCapacity) {
		this.capacity = Math.max(this.capacity, newCapacity);
		this.schema().forEach(function(name) {
			if (this.data[name].length < this.capacity) {
				var temp = arrayPool.get(Float32Array, this.capacity);
				temp.set(this.data[name].subarray(0, this.length));
				arrayPool.push(this.data[name]);
				this.data[name] = temp;
			}
		}.bind(this));
		return this;
	};
	
	Table2.prototype.addCol = function(name, upfunc) {
		if (this.schema().indexOf(name) === -1);
			this.data[name] = arrayPool.get(Float32Array, this.capacity);
			
		if (isExisty(upfunc))
			this.update(upfunc);
		else
			console.warn('adding an uninitialized column to a table is discouraged');
			
		return this;
	};
	
	Table2.prototype.dropAll = function() {
		this.schema().forEach(function(name) {
			arrayPool.push(this.data[name]);
		}.bind(this));
		Table2.call(this);
		return this;
	};
	
	Table2.prototype.isEmpty = function() {
		return this.schema().length === 0 && this.length <= 1;
	};
	
	Table2.prototype.rename = function(map) {
		var s = Date.now();
		this.schema().forEach(function(name) {
			map[name] = map.hasOwnProperty(name)? map[name]: name;
		});
		this.data = Object.getOwnPropertyNames(map)
			.reduce(function(pv, cv) {
				pv[map[cv]] = this.data[cv];
				return pv;
			}.bind(this), {});
		console.log(Date.now() - s, 'per rename');
		return this;
	};
	
	Table2.prototype.clone = function() {
		var s = Date.now();
		var temp = new Table2({capacity: this.capacity});
		temp.setLength(this.length);
		this.schema().forEach(function(name) {
			temp.addCol(name);
			temp.data[name].set(this.data[name].subarray(0, this.length));
		}.bind(this));
		console.log(Date.now() - s, 'per clone');
		return temp;
	};
	
	// operations
	Table2.prototype.update = function(f) {
		var s = Date.now();
		
		var extras = {
			continuous: false,
			ordered: false
		};
		f(this.data, this.length, extras);
		this.gDesc = this.gDesc || this.length + (extras.continuous? 'c': 'd');
		
		console.log(Date.now() - s, 'per map');
		return this;
	};

	// inconsistent alias
	Table2.prototype.map = function(f) {
		console.warn('Table2.map is obsolete. Use Table2.update instead');
		return this.update(f);
	};
	
	Table2.prototype.times = function(table2) {
		var s = Date.now();
		if (!(table2 instanceof Table2))
			throw new Error('non-table right hand argument');
		//if (intersection(Object.getOwnPropertyNames(this.active), Object.getOwnPropertyNames(table2.active)).length !== 0)
		//	throw new Error('Multiplying non-disjoint tables');
		
		if (table2.isEmpty()) {
			return this;
		} if (this.isEmpty()) {
			table2.schema().forEach(function(name) {
				this.data[name] = table2.data[name];
			}.bind(this));
			this.capacity = table2.capacity;
			this.length = table2.length;
			this.gDesc = table2.gDesc;
			return this;
		}
		
		var newLength = this.length * table2.length,
			oldLength1 = this.length,
			oldLength2 = table2.length;
		this.setLength(newLength);
		table2.setLength(newLength);
		
		this.schema().forEach(function(name) {
			this.data[name] = repeatPoints(this.data[name], oldLength1, oldLength2);
		}.bind(this));
		table2.schema().forEach(function(name) {
			this.data[name] = repeatArray(table2.data[name], oldLength2, oldLength1);
		}.bind(this));
		this.gDesc = this.gDesc + '*' + table2.gDesc;
		
		console.log(Date.now() - s, 'per mult');
		return this;
	};
	
	Table2.prototype.select = function(order, target) {
		var s = Date.now();
		var itemsize = order.length,
			n = this.length,
			outsize = n * itemsize;
			
		if (target.length < outsize)
			throw new Error('Insufficient buffer size for export');
			
		for (var j = 0; j < itemsize; j++) {
			var col = this.data[order[j]],
				i = 0,
				k = j;
			if (isExisty(col)) {
				for ( ; i < n; i++, k += itemsize)
					target[k] = col[i];
			} else {
				for ( ; i < n; i++, k += itemsize)
					target[k] = 0;
			}
		}
		
		console.log(Date.now() - s, 'per export');
		return this;
	};
	
	Table2.prototype.minGraphDescriptor = function() {
		// maybe this logic should occur at gDesc modification
		return this.gDesc.split('*')
			.map(function(desc) {
				return {
					qty: parseInt(desc),
					type: desc[desc.length - 1]
				};
			})
			.filter(function(node) {
				return node.qty !== 1;
			})
			.reduce(function(pv, cv) {
				if (pv.length > 0 && (pv[pv.length - 1].type === 'd' && cv.type === 'd'))
					pv[pv.length - 1].qty *= cv.qty;
				else
					pv.push(cv);
				return pv;
			}, []);
	};
	
	Table2.prototype.indexBufferSize = function() {
		var temp = this.minGraphDescriptor().reduceRight(function(pv, cv) {
			var v = cv.qty,
				e = cv.type === 'c'? v - 1: 0;
			return {v: pv.v * v, e: v * pv.e + e * pv.v};
		}, {v: 1, e: 0}).e * 2;
		return temp;
	};
	
	Table2.prototype.computeIndexBuffer = function(buffer) {
		var actions = this.minGraphDescriptor(),		
			key = actions.toString();
			
		if (!Table2.indexCache.hasOwnProperty(key)) {	
			Table2.indexCache[key] = actions.reduceRight(function(pv, cv) {
				var v = cv.qty,
					e = cv.type === 'c'? v - 1: 0,
					newAdj = new Uint32Array(v * pv.e.length + (e * pv.v) * 2),				
					i = 0;
				
				for (i = 0; i < v; i++) {
					newAdj.set(pv.e, i * pv.e.length);
					incArray(pv.e, pv.v);
				}
				
				if (cv.type === 'c') {
					var path = timesArray(pv.v, pathGraph(v));
					for (i = 0; i < pv.v; i++) {
						newAdj.set(path, v * pv.e.length + i * e * 2);
						incArray(path, 1);
					}
				}
				
				return {v: pv.v * v, e: newAdj};
			}, {v: 1, e: new Uint32Array(0)}).e;
		}
		
		buffer.set(Table2.indexCache[key]);
		return this;
	};
	
	Table2.indexCache = {};
	
	
	// the universal table
	var UNIVERSAL = new Table2();
	
	// utils
	
	var arrayPool = {
		pool: {},
		get: function(Constructor, length) {
			if (this.pool.hasOwnProperty(length) && this.pool[length].length !== 0) {
				return this.pool[length].pop();
			} else {
				return new Constructor(length);
			}
		},
		push: function(obj) {
			if (!this.pool.hasOwnProperty(obj.length))
				this.pool[obj.length] = [];
			this.pool[obj.length].push(obj);
		}
	};
			
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
	
	// index buffer utils (to be redone)
	
	function pathGraph(vert, out) { // why out? fixit!
		var edge = vert - 1,
			basicPath = new Uint32Array(edge * 2);
		for (var i = 0, j = 0; i < edge; i++, j += 2) {
			basicPath[j] = i;
			basicPath[j + 1] = i + 1;
		}
		return basicPath;
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
		
		
	// exports
	
	_G.Table2 = Table2;
}(this));