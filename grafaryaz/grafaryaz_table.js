'use strict';

(function(global) {
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		intersection = _GY.intersection,
		union = _GY.union;
		
	function Table(keys, data, opts) {
		if (keys === undefined)
			keys = [];
		else if (!Array.isArray(keys))
			keys = [keys];
			
		if (data === undefined)
			data = [];
		else if (!Array.isArray(data))
			data = [data];
			
		if (opts === undefined)
			opts = {};
			
		if (data.length === 0)
			data.push([]);
		
		
		this.keys = keys;
		
		this.data = data.map(function(e) {
			var temp = Array.isArray(e)? e: [e];
			temp.length = keys.length;
			return temp;
		});
		
		if (opts.gDesc)
			this.gDesc = opts.gDesc;
		else if (opts.cont)
			this.gDesc = this.data.length + 'c';
		else 
			this.gDesc = this.data.length + 'd';
	}

	Table.prototype.isEmpty = function() {
		return this.keys.length === 0 && this.data.length <= 1;
	};

	Table.prototype.clone = function() {
		return new Table(this.keys, this.data);
	};

	Table.prototype.map = function(stmt) {
		var indices = stmt.requires.map(function(name) {
			return this.keys.indexOf(name);
		}.bind(this));
		return new Table(stmt.supplies, evalMap(this.data, stmt.f(), indices), {gDesc: this.gDesc});
	};

	Table.prototype.map2 = function(stmt) {	
		return new Table(stmt.output, inlineMap(this, stmt.body));
	};

	Table.prototype.times = function(table2, cache) {
		//if (cache !== true)
		cache = false;

		if (!(table2 instanceof Table))
			throw new Error('non-table right hand argument');
		if (intersection(this.keys, table2.keys).length !== 0)
			throw new Error('Multiplying non-disjoint tables');
			
		if (this.isEmpty())
			return table2;
		else if (table2.isEmpty())
			return this;
		
		var key = '';
		if (cache) {
			key = this.makeKey() + table2.makeKey();
			if (Table.cache.hasOwnProperty(key))
				return Table.cache[key];
		}
			
		var resData = [];
		this.data.forEach(function(e1) {
			table2.data.forEach(function(e2) {
				resData.push(e1.concat(e2));
			});
		});
		
		var temp = new Table(union(this.keys, table2.keys), resData, {gDesc: this.gDesc + '*' + table2.gDesc});
		if (cache)
			Table.cache[key] = temp;
		return temp;
	};

	Table.prototype.makeKey = function() {
		var key = this.data.length + ':',
			toBase2 = function(x) {
				return x.toFixed(2);
			};
		for (var i = 0; i < this.data.length; i += 1)
			key += ' ' + this.data[i].map(toBase2).join(';');
		//console.log(new Date().getTime() - s, 'to make a key');
		return key;
	};
	
	Table.prototype.asTypedArray = function(order, buffer) {
		var s = new Date().getTime();
		if (order.length > 3)
			throw new Error('chunk size too big');
		if (!(buffer instanceof Float32Array) || buffer.length < this.data.length * order.length)
			buffer = new Float32Array(this.data.length * order.length);

		var indices = order.map(function(name) {
				return this.keys.indexOf(name);
			}.bind(this)),
			bufferIndex = 0,
			chunkSize = order.length;
		
		this.data.forEach(function(pt) {
			buffer[bufferIndex] = pt[indices[0]];
			buffer[bufferIndex + 1] = pt[indices[1]];
			buffer[bufferIndex + 2] = pt[indices[2]];
			bufferIndex += chunkSize;
		});
		console.log(new Date().getTime() - s, 'per export');
		return buffer;
	};
	
	Table.prototype.computeIndexBuffer = function(buffer) {
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
		if (cache && Table.indexCache.hasOwnProperty(key)) {
			buffer.set(Table.indexCache[key]);
			return buffer;
		}
			
		var indexArray = actions.reduceRight(function(adjacency, cv) {
			var newAdj = [], 
				l = cv.qty, 
				r = adjacency.n;
			for (var i = 0; i < l; i++) {
				newAdj = newAdj.concat(adjacency.a);
				shiftArray(adjacency.a, r);
			}
			if (cv.type === 'c') {
				var path = timesArray(r, makeBasicPath(l));
				for (var i = 0; i < r; i++) {
					newAdj = newAdj.concat(path);
					shiftArray(path, 1);
				}
			}
			return {n: r * l, a: newAdj};
		}, {n: 1, a: []});//new Uint8Array(0));
		var temp = new Uint32Array(indexArray.a);
		
		if (cache)
			Table.indexCache[key] = temp;	
		buffer.set(temp);
		return buffer;
	}
	
	Table.cache = {};
	Table.indexCache = {};

	
	// utils
	
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
	

	// map variations
	
	function inPlaceEvalMap(data, callback, indices) {
		var argMap = indices.length? 'pt[' + indices.join('], pt[') + ']' : '',
			temp = new Function('pt', 'f', 'return f(' + argMap + ');');
			
		data.forEach(function(pt, i) {
			data[i] = temp(pt, callback);
		});
	}

	function inlinePtFunction() {
	}

	function evalMap(data, callback, indices) {
		var argMap = indices.length? 'pt[' + indices.join('], pt[') + ']' : '',
			temp = new Function('pt', 'f', 'return f(' + argMap + ');');
		//console.log(callback());
		return data.map(function(pt) {
			return temp(pt, callback);
		});
	}

	function inlineMap(domain, fbody) {
		var arrMap = fbody;
		domain.keys.forEach(function(n, i) {
			arrMap = arrMap.replace(new RegExp('\\b' + n + '\\b', 'g'), 'data[i][' + i + ']');
		});
		var temp2 = new Function('data', 'var res = []; for (var i = 0; i < data.length; i++) res[i] = ' + arrMap + '; return res;');
		return temp2(domain.data);
	}
	
		
	// exports
	
	_GY.Table = Table;
}(this));