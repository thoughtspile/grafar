(function(global) {
	'use strict';
	
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		isExisty = _GY.isExisty,
		intersection = _GY.intersection,
		union = _GY.union;
	
		
	function Table2(opts) {
		opts = opts || {};
	
		this.data = {};		
		this.length = 1;
		this.capacity = opts.capacity || 1;
		
		if (opts.gDesc)
			this.gDesc = opts.gDesc;
		else if (opts.cont)
			this.gDesc = '1c';
		else 
			this.gDesc = '1d';
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
				this.data[name] = temp;
			}
		}.bind(this));
		return this;
	};
	
	Table2.prototype.addCol = function(name) {
		if (this.schema().indexOf(name) === -1);
			this.data[name] = arrayPool.get(Float32Array, this.capacity);
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
	Table2.prototype.map = function(f) {
		var s = Date.now();
		
		f(this.data, this.length);
		
		console.log(Date.now() - s, 'per map');
		return this;
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
		
		var newLength = this.length * table2.length;
		this.extend(newLength);
		table2.extend(newLength);
		
		this.schema().forEach(function(name) {
			this.data[name] = repeatPoints(this.data[name], this.length, table2.length);
		}.bind(this));
		table2.schema().forEach(function(name) {
			this.data[name] = repeatArray(table2.data[name], table2.length, this.length);
		}.bind(this));
		this.setLength(newLength);
		
		console.log(Date.now() - s, 'per mult');
		return this;
		//return new Table(this, {gDesc: this.gDesc + '*' + table2.gDesc}); // gDesc is important
	};
	
	Table2.prototype.select = function(order, target) {
		var s = Date.now();
		var itemsize = order.length,
			n = this.length,
			outsize = n * itemsize;
			
		if (target.length < outsize)
			throw new Error('Insufficient buffer size for export');
			
		for (var j = 0; j < itemsize; j++) {
			var col = this.data[order[j]]; // undefined proxy
			for (var i = 0, k = j; i < n; i++, k += itemsize)
				target[k] = col[i];
		}
		
		console.log(Date.now() - s, 'per export');
		return this;
	};
	
	// uglifiers
	Table2.prototype.computeIndexBuffer = function(buffer) {
		var cache = true;
		var actions = this.gDesc.split('*')
			.map(function(desc) {
				return {
					qty: parseFloat(desc.slice(0, desc.length - 1)),
					type: desc.slice(desc.length - 1)
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
		
		var key = actions.toString();
		if (cache && Table2.indexCache.hasOwnProperty(key)) {
			buffer.set(Table2.indexCache[key]);
			return buffer;
		}
			
		var indexArray = actions.reduceRight(function(adjacency, cv) {
			var newAdj = [], 
				l = cv.qty, 
				r = adjacency.n,
				i = 0;
			for (i = 0; i < l; i++) {
				newAdj = newAdj.concat(adjacency.a);
				shiftArray(adjacency.a, r);
			}
			if (cv.type === 'c') {
				var path = timesArray(r, makeBasicPath(l));
				for (i = 0; i < r; i++) {
					newAdj = newAdj.concat(path);
					shiftArray(path, 1);
				}
			}
			return {n: r * l, a: newAdj};
		}, {n: 1, a: []});//new Uint8Array(0));
		var temp = new Uint32Array(indexArray.a);
		
		if (cache)
			Table2.indexCache[key] = temp;	
		buffer.set(temp);
		return this;
	};
	
	Table2.indexCache = {};
	
	
	// utils
	
	var arrayPool = {
		pool: {},
		get: function(Constructor, length) {
			if (this.pool.hasOwnProperty(length) && this.pool[length].length !== 0) {
				console.log('extract', this.pool);
				return this.pool[length].pop();
			} else {
				console.log('new allocation');
				return new Constructor(length);
			}
		},
		push: function(obj) {
			console.log('drop');
			if (!this.pool.hasOwnProperty(obj.length))
				this.pool[obj.length] = [];
			this.pool[obj.length].push(obj);
			console.log('drop OK');
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
		for (var i = len - 1, t = len * times - 1; i >= 0; i--)
			for (var j = 0; j < times; j++, t--)
				arr[t] = arr[i];
		return arr;
	}
	
	// index buffer utils (to be redone)
	
	function makeBasicPath(length) {
		var basicPath = [];
		for (var i = 0; i < length - 1; i++)
			basicPath.push(i, i + 1);
		return basicPath;
	}
	
	function shiftArray (arr, by) {
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
	
	_GY.Table2 = Table2;
}(this));