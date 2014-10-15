'use strict';
	
(function(global) {
	var _G = global.grafar,
		pool = _G.pool,
		isExisty = _G.isExisty,
		stats = _G.stats,
		union = _G.union,
		repeatArray = _G.repeatArray,
		repeatPoints = _G.repeatPoints,
		incArray = _G.incArray,
		timesArray = _G.timesArray,
		Observable = _G.Observable;
		
	stats.add('rename').add('clone').add('map').add('mult').add('export').add('index');	
	
	
	function Table2(opts) {
		Observable.call(this);
		opts = opts || {};
	
		this.data = {};		
		this.length = 1;
		this.capacity = opts.capacity || 1;
		this.requests = [];
		
		this.gDesc = '';
	}
	
	Table2.prototype = new Observable();
	
	// async
	Table2.prototype.postRequest = function(names, onComplete) {
		this.requests = union(this.requests, names.filter(isExisty));
		return this;
	};
	
	Table2.prototype.postUpdate = function(update, onComplete) {
		return this;
	};
	
	// misc
	Table2.prototype.schema = function() {
		return Object.getOwnPropertyNames(this.data);
	};
	
	Table2.prototype.setLength = function(newLength) {
		if (isExisty(newLength)) {
			this.extend(newLength);
			this.length = newLength;
		}
		return this;
	};
	
	Table2.prototype.extend = function(newCapacity) {
		this.capacity = Math.max(this.capacity, newCapacity);
		this.schema().forEach(function(name) {
			if (this.data[name].length < this.capacity) {
				var temp = pool.get(Float32Array, this.capacity);
				temp.set(this.data[name].subarray(0, this.length));
				pool.push(this.data[name]);
				this.data[name] = temp;
			}
		}.bind(this));
		return this;
	};
	
	Table2.prototype.addCol = function(names, upfunc) {
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.data[name] = this.data[name] || pool.get(Float32Array, this.capacity);
		}
			
		if (isExisty(upfunc))
			this.update(upfunc);
			
		return this;
	};
	
	Table2.prototype.dropAll = function() {
		this.schema().forEach(function(name) {
			pool.push(this.data[name]);
		}.bind(this));
		
		this.data = {};
		this.length = 1;
		this.capacity = 1;
		this.gDesc = '';
		
		return this;
	};
	
	Table2.prototype.isEmpty = function() {
		return this.schema().length === 0 && this.length <= 1;
	};
		
	Table2.prototype.clone = function() {
		stats.enter('clone')
		var temp = new Table2({capacity: this.capacity});
		temp.setLength(this.length);
		this.schema().forEach(function(name) {
			temp.addCol(name);
			temp.data[name].set(this.data[name].subarray(0, this.length));
		}.bind(this));
		stats.exit('clone');
		return temp;
	};
	
	// operations
	Table2.prototype.update = function(f) {
		stats.enter('map');
		
		var extras = {
			continuous: false,
			ordered: false
		};
		f(this.data, this.length, extras);
		this.gDesc = this.gDesc || this.length + (extras.continuous? 'c': 'd');
		
		stats.exit('map');
		return this;
	};

	Table2.prototype.times = function(table2) {
		stats.enter('mult');
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
		
		stats.exit('mult');
		return this;
	};
	
	Table2.prototype.rename = function(map) {
		stats.enter('rename');
		this.schema().forEach(function(name) {
			map[name] = map.hasOwnProperty(name)? map[name]: name;
		});
		this.data = Object.getOwnPropertyNames(map)
			.reduce(function(pv, cv) {
				pv[map[cv]] = this.data[cv];
				return pv;
			}.bind(this), {});
		stats.exit('rename');
		return this;
	};
	
	Table2.prototype.select = function(order, target) {
		stats.enter('export');
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
		
		stats.exit('export');
		return this;
	};
	
	// indexing
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
					newAdj = pool.get(Uint32Array, v * pv.e.length + (e * pv.v) * 2),				
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
				
				pool.push(pv.e);				
				return {v: pv.v * v, e: newAdj};
			}, {v: 1, e: pool.get(Uint32Array, 0)}).e;
		}
		
		buffer.set(Table2.indexCache[key]);
		return this;
	};
	
	Table2.indexCache = {};
	
		
	// index buffer utils (to be redone)
	
	function pathGraph(vert) {
		var edge = vert - 1,
			basicPath = pool.get(Uint32Array, edge * 2);
		for (var i = 0, j = 0; i < edge; i++, j += 2) {
			basicPath[j] = i;
			basicPath[j + 1] = i + 1;
		}
		return basicPath;
	}
			
	// exports
	
	_G.Table2 = Table2;
}(this));