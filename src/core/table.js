'use strict';
	
(function(global) {
	var _G = global.grafar,
		pool = _G.pool,
		isExisty = _G.isExisty,
		union = _G.union,
		setpush = _G.setpush,
		setpop = _G.setpop,
		haveCommon = _G.haveCommon,
		repeatArray = _G.repeatArray,
		repeatPoints = _G.repeatPoints,
		incArray = _G.incArray,
		timesArray = _G.timesArray,
		Observable = _G.Observable;
	
	
	function Table2(opts) {
		Observable.call(this);
		opts = opts || {};

		this._schema = [];
		this.data = {};
		this.needsupdate = {};
		this.using = {};
		this.lastexport = {};
		this.lastupdate = {};
		this.generators = {};
		this.groups = {};
		
		this.length = 1;
		this.capacity = opts.capacity || 1;
		
		this.gDesc = '';
	}
	
	Table2.prototype = new Observable();
	
	
	// misc
	Table2.prototype.schema = function() {
		return this._schema;
	};
	
	Table2.prototype.resize = function(newLength) {
		if (isExisty(newLength)) {
			this.extend(newLength);
			this.length = newLength;
		}
		return this;
	};
	
	Table2.prototype.extend = function(newCapacity) {
		// length is not set here
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
	
	Table2.prototype.define = function(names, using, upfunc) {
		upfunc = upfunc || function() {};
		names = names.slice();
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.data[name] = this.data[name] || pool.get(Float32Array, this.capacity);
			setpush(this.schema(), name);
			
			this.needsupdate[name] = true;
			this.lastupdate[name] = -1;
			this.groups[name] = names;
			this.using[name] = using;
			this.generators[name] = upfunc; // how to trigger multiple?
		}
			
		return this;
	};
	
	Table2.prototype.reset = function() {
		var selfcols = this.schema();
		for (var i = 0; i < selfcols.length; i++)
			this.dropCol(name);	
		this.length = 1;
		this.capacity = 1;
		this.gDesc = '';
		
		return this;
	};
	
	Table2.prototype.dropCol = function(name) {
		var col = this.data[name];
		if (isExisty(col)) {
			pool.push(col);
			delete this.data[name];
			setpop(this.schema(), name)
		}
		
		return this;
	}
	
	Table2.prototype.isEmpty = function() {
		return this.schema().length === 0 || this.length === 1;
	};
		
	Table2.prototype.clone = function() {
		var temp = new Table2({capacity: this.capacity}).resize(this.length),
			selfcols = this.schema(),
			selfdata = this.data;
		
		for (var i = 0; i < selfcols.length; i++) {
			var name = selfcols[i];
			temp.addCol([name], function(data, l) {
				data[name].set(selfdata[name].subarray(0, l));
			});
		}
		// and some listeners to sync upflags
		
		return temp;
	};
	
	
	// operations
	Table2.prototype.update = function(f) {
		// extras class maybe
		var extras = { continuous: false, ordered: false };
		f(this.data, this.length, extras);
		this.gDesc = this.gDesc || this.length + (extras.continuous? 'c': 'd');
		return this;
	};

	Table2.prototype.refresh = function(names) {
		var frameId =  _G.frameId;
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			if (this.needsupdate[name]) {
				this.refresh(this.using[name]);
				this.update(this.generators[name]);
				var group = this.groups[name];
				for (var j = 0; j < group.length; j++) {
					this.lastupdate[group[j]] = frameId;
					this.needsupdate[group[j]] = false;
				}
			}
		}
		return this;
	}

	Table2.prototype.times = function(table2) {
		if (haveCommon(this.schema(), table2.schema()))
			throw new Error('Multiplying non-disjoint tables');
		
		var table1 = this,
			len1 = table1.length,
			len2 = table2.length,
			newLen = len1 * len2,
			res = new Table2();
			
		res.resize(newLen);
		// repeatArray is cheaper!
		// + short-circuit for empty table
		table1.schema().forEach(function(name) {
			res.define([name], [], function(data) {
				table1.refresh([name]);
				data[name].set(table1.data[name]);
				repeatPoints(data[name], len1, len2);
			});
		});
		table2.schema().forEach(function(name) {
			res.define([name], [], function(data, l) {
				table2.refresh([name]);
				data[name].set(table2.data[name]);
				repeatArray(data[name], len1, len2);
			});
		});
		res.gDesc = table1.gDesc + '*' + table2.gDesc;
		
		return res;
	};
		
	Table2.prototype.export = function(order, target) {
		var frameId = _G.frameId;
		this.refresh(order);
		var s = performance.now();
		
		var itemsize = order.length,
			n = Math.min(this.length, target.length / itemsize);
		
		if (itemsize === 1)
			target.set(this.data[order[0]].subarray(0, n));
			
		for (var j = 0; j < itemsize; j++) {
			if (isExisty(order[j]) && this.lastupdate[order[j]] === frameId) {
				var col = this.data[order[j]];
				for (var i = 0, k = j; i < n; i++, k += itemsize)
					target[k] = col[i];
			}
		}
		
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