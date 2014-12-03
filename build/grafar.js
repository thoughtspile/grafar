'use strict';

(function(global) {
	var _G = (global.grafar = {}),
		panels = [];
				
	var config = {
		debug: true,
		
		rootGraphId: '$',
		
		minPanelWidth: 600,
		minPanelHeight: 600,
		container: window,
		antialias: true,
		
		axes: ['x', 'y', 'z'],
		axisLength: 2,
		
		particleRadius: 4,
		
		tweenTime: 900,		
		tweenFunction: function(s, e, t) {
			var part = (1 - Math.cos(Math.PI * t / _G.config.tweenTime)) / 2;  // non-local reference
			return s * (1 - part) + e * part;
		},
		
		grafaryaz: {
			samples: 100,
			tol: 0.001,
			samplesPerDOF: 24,
			diffStep: 0.001
		}
	};
		
	var update = function() {
		var len = panels.length;
		for (var i = 0; i < len; i++)
			panels[i].update();
		_G.frameId++;
		global.requestAnimationFrame(update);
	};
	
	function setup(changes, target) {
		target = target || config;
		Object.keys(changes).forEach(function(name) {
			if (target.hasOwnProperty(name))
				if (name !== 'grafaryaz')
					target[name] = changes[name];
				else
					setup(changes[name], config.grafaryaz);
		});
		return _G;
	}
	
	
	// export
	
	_G.config = config;
	_G.panels = panels;
	_G.update = update;
	_G.setup = setup;
	_G.frameId = 0;
	
	update();
}(this));'use strict';

(function(global) {
	var _G = global.grafar;
		
	
	global.Float32Array = global.Float32Array || Array;
	global.Uint32Array = global.Uint32Array || Array;
	global.Uint16Array = global.Uint16Array || Array;
	global.Uint8Array = global.Uint8Array || Array;
	
	global.performance = global.performance || {};
	global.performance.now = 
		global.performance.now ||
		global.performance.mozNow ||
		global.performance.msNow ||
		global.performance.oNow ||
		global.performance.webkitNow ||
		Date.now ||
		function() { return new Date().getTime(); };
	
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		performance = window.performance;
	
			
	function makeID(obj) {
		while (true) {
			var temp = Math.random().toString(36).substr(2, 9); 
			if (!(temp in obj))
				return temp;
		}
	}
					
	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
		
	function strToArray (str) {
		if (typeof str === 'string')
			return str.replace(/ /g, '').split(',');
		else 
			return str.filter(isExisty);
	}
	
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
	
	var stats = {
		actions: {},
		clocks: {},
		
		report: function() {
			var temp = {},
				aNames = Object.getOwnPropertyNames(this.actions)
			aNames.forEach(function(actionName) {
					var times = this.actions[actionName].times;
					if (times.length > 0)
						temp[actionName] = {
							max: Math.max.apply(null, times),
							min: Math.min.apply(null, times),
							average: times.reduce(function(pv, cv) { return pv + cv; }, 0) / times.length,
							total: times.reduce(function(pv, cv) { return pv + cv; }, 0),
							raw: times
						};
				}.bind(this));
			return temp;
		},
		
		add: function(name) {
			this.actions[name] = {
				times: []
			};
			return this;
		},
		
		enter: function(name) {
			this.clocks[name] = performance.now();
			return this;
		},
		
		exit: function(name) {
			this.actions[name].times.push(performance.now() - this.clocks[name]);
			return this;
		}
	};
	
	
	_G.stats = stats;
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.asArray = strToArray;
	_G.incArray = incArray;
	_G.timesArray = timesArray;
	_G.repeatArray = repeatArray;
	_G.repeatPoints = repeatPoints;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		makeID = _G.makeID,
		isExisty = _G.isExisty;
	
	var objects = {};
	
	function Observable() {
		var id = makeID(objects);
		objects[id] = true;
		this.id = id;
		
		this.handlers = {};
	}
	
	Observable.prototype.on = function(event, handler) {
		if (!isExisty(this.handlers[event]))
			this.handlers[event] = [];
		this.handlers[event].push(handler);
		return this;
	};
	
	Observable.prototype.off = function(event, handler) {
		var handlers = this.handlers[event];
		if (isExisty(handlers)) {
			var index = handlers.indexOf(handler);
			if (index !== -1)
				handlers.splice(index, 1);
		}
		return this;
	};
	
	Observable.prototype.dispatch = function(event) {
		if (isExisty(this.handlers[event])) {
			var queue = this.handlers[event];
			for (var i = 0; i < queue.length; i++)
				queue[i]();
		}
		return this;
	};
	
	
	// export
	
	_G.objects = objects;
	_G.Observable = Observable;
}(this));(function(global) {
	var _G = global.grafar,
		isExisty = _G.isExisty,
		stats = _G.stats;
	
	stats.add('alloc').add('free');
	
	var arrayPool = {};
	
	arrayPool.pool = {};
		
	arrayPool.get = function(Constructor, length) {
		stats.enter('alloc');
		var classKey = Constructor.toString(),
			constructorKey = length.toString(),
			classPool = this.pool[classKey],
			temp = null;
		if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0)
			temp = classPool[constructorKey].pop();
		else
			temp = new Constructor(length);
		stats.exit('alloc');
		return temp;
	};
		
	arrayPool.push = function(obj) {
		stats.enter('free');
		var classKey = obj.constructor.toString(),
			constructorKey = obj.length.toString();
			
		if (!isExisty(this.pool[classKey]))
			this.pool[classKey] = {};
		if (!isExisty(this.pool[classKey][constructorKey]))
			this.pool[classKey][constructorKey] = [];
			
		this.pool[classKey][constructorKey].push(obj);
		stats.exit('free');
	};
		
	arrayPool.flush = function() {
		this.pool = {};
	};
	
	
	// export
	
	_G.pool = arrayPool;
}(this));'use strict';

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
}(this));'use strict';

(function(global) {
	var _G = global.grafar;
	
	
	function zeroVector(len) {
		var zero = [];
		for (var i = 0; i < len; i++)
			zero[i] = 0;
		return zero;
	}
	
	function dot(a, b) {
		var temp = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			temp += a[i] * b[i];
		return temp;
	}
	
	function norm(a) {
		var aNorm = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			aNorm += Math.abs(a[i]);
		return aNorm;
	}
	
	function dist(a, b) {
		var abDist = 0,
			l = a.length;
		for (var i = 0; i < l; i++)
			abDist += Math.abs(a[i] - b[i]);
		return abDist;
	}

	function arraySum(a, b, out) {
		var l = a.length;
		for (var i = 0; i < l; i++)
			out[i] = a[i] + b[i];
	}

	function arrayTimes(n, b, out) {
		var l = b.length;
		for (var i = 0; i < l; i++)
			out[i] = n * b[i];
	}
	
	
	_G.zeroVector = zeroVector;
	_G.dot = dot;
	_G.norm = norm;
	_G.dist = dist;
	_G.arraySum = arraySum;
	_G.arrayTimes = arrayTimes;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		dot = _G.dot,
		norm = _G.norm,
		arraySum = _G.arraySum,
		arrayTimes = _G.arrayTimes,
		config = _G.config.grafaryaz,
		stats = _G.stats;
	
	stats.add('probe').add('trace');
	
	function zeros(arr, l) {
		for (var i = 0; i < l; i++)
			arr[i] = 0;
		return arr;
	};
	
	function randomize(arr, l, mean, spread) {
		for (var i = 0; i < l; i++)
			arr[i] = mean + spread / 2 * (Math.random() + Math.random() - 1);
	}
	
	function pow (x, p) {
		var temp = Math.pow(x, p);
		if (!isNaN(temp))
			return temp;
			
		temp = -Math.pow(-x, p);
		if (Math.abs(Math.pow(temp, 1 / p) - x) < config.tol)
			return temp;
		
		return NaN;
	}
	
	function constant(val, name) {
		return function(data, l, extras) {
			for (var i = 0; i < l ; i++)
				data[name][i] = val;
			extras.continuous = true;
		};
	}
	
	function ints(m, name) {
		m = Number(m);
		return function(data, l, extras) {
			for (var i = 0; i < l; i++)
				data[name][i] = m + i;
			extras.continuous = false;
		};
	}
	
	function seq(a, b, name, closed, discrete) {
		a = Number(a);
		b = Number(b);
		discrete = discrete || false;
		var closeFix = (closed === true? 0: 1);
		return function(data, l, extras) {
			var step = (b - a) / (l - closeFix);
			for (var i = 0; i < l; i++)
				data[name][i] = a + i * step;
			extras.continuous = !discrete;
		};
	}
	
	function logseq(a, b, name) {
		a = Number(a);
		b = Number(b);
		var closeFix = (closed === true? 0: 1);
		return function(data, l, extras) {
			console.log('logseq ' + name);
			var step = (b - a) / Math.log(l);
			for (var i = 1; i < l + 1; i++)
				data[name][i] = a + Math.log(i) * step;
			extras.continuous = true;
		};
	}
		
	function traceZeroSet(f, names) {
		var dof = names.length,
			tol = config.tol,
			gradf = grad(f, dof),
			probeSize = 100,
			thisid = Math.random().toFixed(10),
			mean = [],
			spread = [],
			pt = [],
			realSize = 0,
			isEmpty = false,
			needsReshuffle = true;
		
		function estimator(flatData, l) {
			var i = 0, j = 0;
			
			realSize = 0;
			
			for (i = 0; i < probeSize; i++) {
				for (j = 0; j < dof; j++)
					pt[j] = -10 + 20 * Math.random();
				newton(pt, f, gradf, false, 100);
				if (f(pt) < tol) {
					for (var j = 0; j < dof; j++)
						flatData[j][i] = pt[j];
					realSize++;
				}
			}
			
			for (j = 0; j < dof; j++) {
				var col = flatData[j],
					jmin = 1000,
					jmax = -1000,
					jsum = 0;
				for (i = 0; i < realSize; i++) {
					var val = col[i];
					jmin = Math.min(val, jmin);
					jmax = Math.max(val, jmax);
					jsum += val;
				}
				mean[j] = jsum / realSize;
				spread[j] = 2 * (jmax - jmin);
			}
		}
		
		function constructor(data, l, extras) {
			var flatData = names.map(function(name) {
					return data[name];
				}),
				i = 0, 
				j = 0;
				
			//var speed = {};
			var s = performance.now();
			estimator(flatData, l);
			//speed['est'] = performance.now() - s;
			
			//var s = performance.now();
			if (realSize === 0 && !isEmpty) {
				//console.log('empty');
				for (var j = 0; j < dof; j++)
					zeros(flatData[j], l);
				needsReshuffle = true;
				isEmpty = true;
				return;
			}
			
			//console.log(invalids);
			if (true) {//realSize !== 0 && (needsReshuffle || invalids > 15)) {
				//console.log('reshuffle');
				for (j = 0; j < dof; j++)
					randomize(flatData[j], l, mean[j], spread[j]);
				needsReshuffle = false;
				isEmpty = false;
			}
			//speed['check'] = performance.now() - s;
			
			//var s = performance.now();
			if (!isEmpty) {
				for (i = 0; i < l; i++) {
					for (j = 0; j < dof; j++)
						pt[j] = flatData[j][i];
					newton(pt, f, gradf, false, 30);
					for (var j = 0; j < dof; j++)
						flatData[j][i] = pt[j];
				}
			}
			//console.log(performance.now() - s);
				
			extras.continuous = false;
		};
		constructor.id = thisid;
		return constructor;
	}

	function grad(fa, nargs) {
		var diffStep = config.diffStep;
		return function(pt, val, out) {
			for (var i = 0; i < nargs; i++) {
				pt[i] += diffStep;
				out[i] = (fa(pt) - val) / diffStep;
				pt[i] -= diffStep;
			}
		};
	}

	var nabla = [], offset = [];
	function newton(pt, f, gradf, acceptNeg, maxIter) {
		var tol = config.tol,
			val = 0,
			i = 0,
			j = 0,
			posterr = 0,
			l = pt.length;
		
		for (i = 0; i < maxIter; i++) {
			val = f(pt);
			gradf(pt, val, nabla);
			posterr = -val / dot(nabla, nabla);
			for (j = 0; j < l; j++)
				offset[j] = posterr * nabla[j];
			if (norm(offset) < tol)
				return pt;
			for (j = 0; j < l; j++)
				pt[j] += offset[j];
		}
		
		for (j = 0; j < l; j++)
			pt[j] = 0; ////// WWWWWWWWWWWWWWTTTTTTTTTTTTTTFFFFFFFFFFF
		return pt;
	}

	
	// exports
	
	_G.constant = constant;
	_G.ints = ints;
	_G.seq = seq;
	_G.logseq = logseq;
	_G.traceZeroSet = traceZeroSet;
	_G.pow = pow;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		union = _G.union;
	
	function GraphData() {
		this.names = {};
		this.from = {};
		this.to = {};
	}
	
	GraphData.prototype.addNode = function(name) {
		if (!this.names[name]) {
			this.names[name] = true;
			this.from[name] = [];
			this.to[name] = [];
		}
		
		return this;
	};
	
	GraphData.prototype.addEdge = function(v1, v2) {
		this.addNode(v1);
		this.addNode(v2);
		if (this.from[v1].indexOf(v2) === -1)
			this.from[v1].push(v2);
		if (this.to[v2].indexOf(v1) === -1)
			this.to[v2].push(v1);
		return this;
	};
	
	GraphData.prototype.parents = function(vset) {
		var par = [];
		for (var i = 0; i < vset.length; i++)
			par = union(par, this.to[vset[i]]);
		return par;
	};
	
	GraphData.prototype.up = function(sources) {
		var closed = [],
			open = sources.slice(),
			self = this;
		while (open.length !== 0) {
			open = open.reduce(function(pv, cv) {
				return union(self.to[cv], pv);
			}, []);
			closed = union(closed, open);
		};
		return closed;
	};
	
	GraphData.prototype.down = function(sinks) {
		var closed = [],
			open = sinks.slice(),
			self = this;
		while (open.length !== 0) {
			open = open.reduce(function(pv, cv) {
				return union(self.from[cv], pv);
			}, []);
			closed = union(closed, open);
		};
		return closed;
	};
	
	_G.GraphData = GraphData;
}(this));'use strict';

(function(global) {	
	var _G = global.grafar,
		Color = global.Color,
		THREE = global.THREE,
		isExisty = _G.isExisty,
		config = _G.config,
		Observable = _G.Observable,
		makeID = _G.makeID;
		
	var styles = {};
	
	function randomLab() {
		return {
			l: 60,
			a: -100 + Math.floor(200 * Math.random()),
			b: -100 + Math.floor(200 * Math.random())
		};
	}
	
	function Style(init) {
		Observable.call(this);
		
		init = init || {};
			
		this.id = init.id || makeID(styles);		
		styles[this.id] = this;
		
		this.alpha = null;
		this.start = null;
		this.end = null;
		
		this.points = null;
		this.radius = null;
		
		this.lines = null;
		
		this.palette = [];
		this.colors = {};
		this.materials = {};
		
		this.update(init);
		this.samplePalette(init.paletteSize);
		
		return this;
	}
	
	Style.prototype = new Observable();
	
	Style.prototype.samplePalette = function(paletteSize) {
		paletteSize = paletteSize || 10;
		for (var i = 0; i < paletteSize; i++) {
			var rgb = Color.convert(randomLab(), 'rgb'),
				rgb2 = new THREE.Color('rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
			this.palette.push(rgb2);
		}
		return this;
	};
	
	Style.prototype.pull = function(id) {
		this.materials[id] = {
			line: new THREE.LineBasicMaterial({}),
			point: new THREE.PointCloudMaterial({size: config.particleRadius, transparent: true, opacity: 0.5, sizeAttenuation: false})
		};		
		this.colors[id] = this.palette[(Object.getOwnPropertyNames(this.colors).length + 1) % this.palette.length];
		this.updateMaterials(id);
	};
	
	Style.prototype.updateMaterials = function(id) {
		this.materials[id].line.color = this.colors[id];
		this.materials[id].point.color = this.colors[id];
		this.materials[id].line.needsUpdate = true;
		this.materials[id].point.needsUpdate = true;
	};
	
	Style.prototype.setPalette = function(palette) {
		this.palette = palette.map(function(col) {
			return new THREE.Color(col);
		});
		return this;
	};
	
	Style.prototype.update = function(styleChanges) {
		Object.getOwnPropertyNames(styleChanges || {}).forEach(function(name) {
			if (this.hasOwnProperty(name))
				this[name] = styleChanges[name];
		}.bind(this));
		
		return this;
	};
		
	Style.prototype.getLineMaterial = function(id) {
		id = id || 'def';
		if (!isExisty(this.colors[id]))
			this.pull(id);
		return this.materials[id].line;
	};
	
	Style.prototype.getParticleMaterial = function(id) {
		id = id || 'def';
		if (!isExisty(this.colors[id]))
			this.pull(id);
		return this.materials[id].point;
	};
		
	_G.styles = styles;
	_G.Style = Style;
}(this));'use strict';
	
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
		
		this._gDesc = '';
	}
	
	Table2.prototype = new Observable();
	
	
	// misc
	Table2.prototype.gDesc = function() {
		return this._gDesc;
	};
	
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
		this._gDesc = '';
		
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
		this._gDesc = this._gDesc || this.length + (extras.continuous? 'c': 'd');
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
				repeatArray(data[name], len2, len1);
			});
		});
		res.gDesc = function() {
			return table1.gDesc() + '*' + table2.gDesc();
		};
		
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
		return this.gDesc().split('*')
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
				
				// copy current graph
				for (i = 0; i < v; i++) {
					newAdj.set(pv.e, i * pv.e.length);
					incArray(pv.e, pv.v);
				}
				
				// edges across
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
	
	Table2.prototype.computeMeshIndex = function(buffer) {
		var mgd = this.minGraphDescriptor();
		if (mgd[0].type !== 'd')
			mgd.splice(0, 0, {qty: 1, type: 'd'});
		if (mgd[2].type !== 'd')
			mgd.splice(2, 0, {qty: 1, type: 'd'});
		if (mgd.length !== 5)
			mgd.push({qty: 1, type: 'd'});
			
		var rMult = mgd[4].qty,
			rSize = mgd[3].qty,
			lMult = mgd[2].qty * mgd[3].qty * rMult,
			lSize = mgd[1].qty,
			fMult = mgd[0].qty,
			pointer = 0;
			
		for (var i = 0; i < lSize - 1; i++)
			for (var j = 0; j < rSize - 1; j++) {
				buffer[pointer] = i * lMult + j * rMult;
				buffer[pointer + 1] = i * lMult + (j + 1) * rMult;
				buffer[pointer + 2] = (i + 1) * lMult + j * rMult;
				pointer += 3;
				
				buffer[pointer] = (i + 1) * lMult + j * rMult;
				buffer[pointer + 1] = i * lMult + (j + 1) * rMult;
				buffer[pointer + 2] = (i + 1) * lMult + (j + 1) * rMult;
				pointer += 3;
			}
			
		var basic = pool.get(Uint32Array, pointer);
		basic.set(buffer.subarray(0, pointer));
		console.log(this.length);
		for (var i = 1; i < rMult; i++)
			buffer.set(incArray(basic, fMult), pointer * i);
				
		return this;
	}
	
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
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		intersection = _G.intersection,
		interPower = _G.interPower,
		haveCommon = _G.haveCommon,
		union = _G.union,
		firstMatch = _G.firstMatch,
		GraphData = _G.GraphData,
		setMinus = _G.setMinus,
		setpush = _G.setpush,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = [];
		this.constraints = [];
		this.known = {};
		this.graph = new GraphData();
	}
	
	Database.prototype = new Observable();
	
	Database.prototype.constrain = function(constraint) {
		//console.log('c in');
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen,
			isExplicit = !haveCommon(names, using),
			fn = constraint.fn || function() { return 0; },
			onConflict = 'overwrite';
			
		var conflicts = this.constraints.filter(function(c) {
				return haveCommon(c.what, names);
			}),
			def = {
				what: names, // is the matching connectivity component
				as: as,
				baseTable: null,
				using: using,
				maxlen: maxlen // only for root CCs
			};
		//console.log('c', def);
		
		if (conflicts.length !== 0) {
			if (onConflict === 'overwrite') {
				this.constraints = setMinus(this.constraints, conflicts);
				// only psubs
				def.baseTable = conflicts[0].baseTable;
			}
			// Merge dupe explicit: x = f(v) <- x = g(v): add f(v) = g(v)
			// Adding i to e: x = f(v) <- f(x, v) = g(u): Will cascade
			// Adding i to i: F(v) = 0 <- G(v) = 0: OK for ConComp
		}
		this.constraints.push(def);
		
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.known[name] = false; // tabwise

			this.graph.addNode(name);
			for (var j = 0; j < using.length; j++)
				this.graph.addEdge(using[j], name);
		}
		
		//console.log('cascade');
		var cascadeChanges = this.graph.down(names);
		for (var i = 0; i < cascadeChanges.length; i++)
			this.known[cascadeChanges[i]] = false;
		this.setUpdate(names);

		//console.log('c out');
		return this;
	};
	
	Database.prototype.select = function(names) {
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		// evaluate all definitions
		// problem: r-copies of atomic table remain the same!
		for (var i = 0; i < names.length; i++) {
			if (!this.known[names[i]]) { // tabwise ups
				var def = firstMatch(this.constraints, function(c) {
						return c.what.indexOf(names[i]) !== -1;
					});
				if (!isExisty(def.baseTable)) {
					var parents = this.graph.to[names[i]], // is name enough?
						tab = this.select(parents).resize(def.maxlen).define(def.what, def.using, def.as);
					// OLD TABLE REMAINS    !!!!!!!!!!!!!!!!!!!!!!
					//console.log('redefine', def.as.id);
					//this.tables = []; // THIS IS LIKE EVEN WORSE   !!!!!!!!!!!!!!!!!!!!!
					setpush(this.tables, tab);
					def.baseTable = tab;
				} else {
					def.baseTable.define(def.what, def.using, def.as);
				}
				for (var j = 0; j < def.what.length; j++)
					this.known[def.what[j]] = true;
			}
		}
		
		// select best tables
		var tabs = [];
		while (names.length > 0) {
			var bestRate = 0, 
				tab = null;
			for (var i = 0; i < this.tables.length && bestRate < names.length; i++) {
				var rate = interPower(this.tables[i].schema(), names);
				if (rate > bestRate) {
					bestRate = rate;
					tab = this.tables[i];
				}
			}
			tabs.push(tab);
			names = setMinus(names, tab.schema());
		}
		
		// multiply
		var temp = tabs[0];
		for (var i = 1; i < tabs.length; i++) {
			temp = temp.times(tabs[i]);
			this.tables.push(temp);
		}
		
		return temp;
	};
	
	Database.prototype.setUpdate = function(names) {
		var affected = union(names, this.graph.down(names));
		for (var i = 0; i < this.tables.length; i++)
			for (var j = 0; j < affected.length; j++)
				this.tables[i].needsupdate[affected[j]] = true;		
	};
		
	Database.prototype.prepare = function() {
		// Inline explicits into implicits where possible.
		// Group CCs.
	};
	
	
	Database.prototype.postSelect = function() {
		
	};
			
	_G.Database = Database;
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar,
		_T = global.THREE,
		
		Database = _G.Database,
		Style = _G.Style,
		Observable = _G.Observable,
		pool = _G.pool,
		
		Object3D = _T.Object3D,
		PointCloud = _T.PointCloud,
		Line = _T.Line,
		LinePieces = _T.LinePieces,
		BufferGeometry = _T.BufferGeometry,
		BufferAttribute = _T.BufferAttribute;
	
	
	function Object(opts) {
		Observable.call(this);
		
		this.db = new Database();
		this.uniforms = {
			style: new Style()
		};
		this.glinstances = [];
		this.hidden = false;
	}
	
	Object.prototype = new Observable();
	
	Object.prototype.pin = function(panel) {
		var pointGeometry = new BufferGeometry(),
			lineGeometry = new BufferGeometry(),
			meshGeometry = new BufferGeometry(),
			position = new BufferAttribute(pool.get(Float32Array, 0), 3),
			lineIndex = new BufferAttribute(pool.get(Uint32Array, 0), 2),
			meshIndex = new BufferAttribute(pool.get(Uint32Array, 0), 3),
			normal = new BufferAttribute(pool.get(Float32Array, 0), 3);
			
		pointGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('position', position);
		meshGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('index', lineIndex);
		meshGeometry.addAttribute('index', meshIndex);
		meshGeometry.addAttribute('normal', normal);
		
		// lame color
		var meshMaterial = new THREE.MeshLambertMaterial({
			side: THREE.DoubleSide,
			color: 0xffffff
		});
		var object = new Object3D()
			.add(new PointCloud(pointGeometry, this.uniforms.style.getParticleMaterial(this.id)))	
			.add(new Line(lineGeometry, this.uniforms.style.getLineMaterial(this.id), LinePieces))
			.add(new THREE.Mesh(meshGeometry, meshMaterial));
		
		panel.scene.add(object);
			
		this.glinstances.push({
				panel: panel,
				target: position,
				index: lineIndex,
				meshIndex: meshIndex,
				normal: normal,
				object: object,
				resize: function(size) {
					var oldArr = this.target.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.target.array);
						this.target.array = temp;
					}
				},
				resizeIndex: function(size) {
					var oldArr = this.index.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.index.array);
						this.index.array = temp;
					}
				},
				resizeMeshIndex: function(size) {
					var oldArr = this.meshIndex.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.meshIndex.array);
						this.meshIndex.array = temp;
					}
				},
				resizeNormals: function(size) {
					var oldArr = this.normal.array,
						oldSize = oldArr.length;
					if (size !== oldSize) {
						var temp = pool.get(oldArr.constructor, size);
						temp.set(oldArr.subarray(0, Math.min(oldSize, size)));
						pool.push(this.normal.array);
						this.normal.array = temp;
					}
				}
			}
		);
		console.log('hello');
		
		//var self = this;
		//panel.on('update', function() {self.db.refresh();});
		//this.db.on('update', function() {});
		
		return this;
	};
	
	Object.prototype.constrain = function(constraint) {
		this.db.constrain(constraint);
		return this;
	};
	
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i],
				names = instance.panel._axes;
				
			var tab = this.db.select(names);
			instance.resize(tab.length * names.length);
			tab.export(names, instance.target.array);
			instance.target.needsUpdate = true;
			
			 var edgeCount = tab.indexBufferSize(),
				 hasEdges = (edgeCount !== 0);
			instance.object.children[0].visible = !hasEdges;
			instance.object.children[1].visible = hasEdges;
			if (hasEdges) {
				instance.resizeIndex(edgeCount);
				tab.computeIndexBuffer(instance.index);
				needsUpdate
			}
			
			// var faceCount = 2*30*50*16*3;//tab.indexBufferSize(),
			// instance.object.children[0].visible = false;
			// instance.object.children[1].visible = false;
			// if (true) {
				// instance.resizeMeshIndex(faceCount);
				// instance.resizeNormals(tab.length * names.length);
				// tab.computeMeshIndex(instance.meshIndex.array);
				// instance.object.children[2].geometry.computeVertexNormals();
			// }
		}
		return this;
	}
	
	Object.prototype.hide = function(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	}
			
	_G.Object = Object;
}(this));'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Observable = _G.Observable,
		Table2 = _G.Table2,
		isExisty = _G.isExisty;
	
	var generators = {};
	
	function Generator() {
		Observable.call(this);
		this.actions = [];
	}
	
	Generator.prototype = new Observable();
	
	Generator.prototype.set = function() {
	};
	
	Generator.prototype.update = function() {
	};
	
	Generator.prototype.execute = function(table) {
		table = table || this.table || new Table2();
		
		var queue = this.actions;
		for (var i = 0; i < queue.length; i++)
			queue[i](table);
		
		return table;
	};
	
	Generator.prototype.data = function(table) {
		this.table = table;
		return this;
	};
	
	
	// exports
	
	_G.generators = generators;
	_G.Generator = Generator;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		config = _G.config.grafaryaz,
		Table2 = _G.Table2,
		union = _G.union,
		setMinus = _G.setMinus;

	function joinInput(nodes) {
		return nodes.map(function(f) {
				return f.requires;
			})
			.reduce(union, []);
	}
	
	
	function Plan(nodes, targetRef) {
		var target = targetRef.slice(),
			extensions = {},
			prePlan = [],
			counter = -1;
		
		while (target.length !== 0) {
			var stepMaps = [];
			while (target.length !== 0) {
				var name = target[0];
				
				for (var i = 0; i < nodes.length && nodes[i].supplies.indexOf(name) === -1; i++);
				if (i >= nodes.length)
					throw new Error('failed to find variable: ' + name);
					
				var temp = nodes[i],
					supplies = temp.supplies;
				target = setMinus(target, supplies);
				if (temp === undefined)
					throw new Error('variable not specified in any way:' + name);
				
				if (temp.mode === 'eq') {
					stepMaps.push(temp);
				} else if (temp.mode === 'in' || temp.mode === 'implicit') {
					if (!extensions.hasOwnProperty(name))
						extensions[supplies.join()] = {node: temp, last: counter};
					extensions[supplies.join()].first = counter;
				}
			}
			target = joinInput(stepMaps);
			prePlan = [{maps: stepMaps, extenders: []}].concat(prePlan);
			counter--;
		}
		
		Object.getOwnPropertyNames(extensions).forEach(function(names) {
			extensions[names].first += prePlan.length;
			extensions[names].last += prePlan.length;
			prePlan[extensions[names].first].extenders.push(extensions[names].node);
		});
		
		this.steps = prePlan.map(function(rawStep) {
			return new Plan.Step(rawStep.maps, rawStep.extenders);
		});
	}

	Plan.prototype.sequence = function() {
		return this.steps.reduce(function(pv, step) {
			step.maps.forEach(function(map) {
				pv.push(function(tab) {
					tab.addCol(map.supplies, map.f());
				});
			});
			step.ranges.forEach(function(extender) {
				var len = (extender.mode === 'in'? config.samples: Math.pow(config.samplesPerDOF, extender.variables.length));
				pv.push(function(tab) {
					tab.times(new Table2({capacity: len}) // argh
						.setLength(len)
						.addCol(extender.supplies, extender.f())
					);
				});
			});
			return pv;
		}, []);
	};
	
	Plan.Step = function(maps, extenders) {
		this.ranges = extenders;
		this.maps = maps;
	};
	
	
	// global
	
	_G.Plan = Plan;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		parserConfig = _G.config.grafaryaz,
		stats = _G.stats,
		
		seq = _G.seq,
		traceZeroSet = _G.traceZeroSet,
		
		haveCommon = _G.haveCommon,
		isExisty = _G.isExisty,
		firstMatch = _G.firstMatch,
		union = _G.union,
		unique = _G.unique,
		setMinus = _G.setMinus,
		
		Plan = _G.Plan;

	stats.add('parse').add('merge').add('plan');
	// locals
	
	var prefixes = {
		sin: 'Math.sin',
		cos: 'Math.cos',
		sqrt: 'Math.sqrt',
		tan: 'Math.tan',
		pow: 'grafar.pow',
		min: 'Math.min',
		max: 'Math.max',
		exp: 'Math.exp',
		abs: 'Math.abs',
		log: 'Math.log'
	},
		regexTemplates = {
			number: '[+-]?[0-9]*\\.?[0-9]+',
			integer: '[+-]?[0-9]*',
			id: '[A-Za-z_]+[A-Za-z0-9_]*',
			postVar: '(?=$|[\\)+\\-*\\/\\^\\,])',
			postFunc: '(?=\\()'
		};
	regexTemplates.literal = '(?:' + regexTemplates.number + '|' + regexTemplates.id + ')';
	var	parserRegex = {
			range: new RegExp('^\\[' + regexTemplates.number + '\\,' + regexTemplates.number + '\\]$'),
			set: new RegExp('^\\{(?:' + regexTemplates.number + ',)*' + regexTemplates.number + '\\}$'),
			id: new RegExp('^' + regexTemplates.id + '$|^$'), // includes empty string
			variables: new RegExp(regexTemplates.id + regexTemplates.postVar, 'g'),
			functions: new RegExp(regexTemplates.id + regexTemplates.postFunc, 'g'),
			literals: new RegExp(regexTemplates.literal, 'g'),
			signature: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.id + ',)*' + regexTemplates.id + '\\)$'),
			call: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)$'),
			allCalls: new RegExp(regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)', 'g'), // call site this is called
			pds: new RegExp(regexTemplates.id + '\'' + regexTemplates.id, 'g'),
			//brackets: /[\[\]\{\}]/g,
			comparator: /(==|@=|<=|>=)/
		},
		compNames = (function() {
			var temp = {};
			temp['>='] = 'geq';
			temp['<='] = 'leq';
			temp['=='] = 'eq';
			temp['@='] = 'in';
			return temp;
		}());

	function snapNodeState(arr) {
		return arr.map(function(node) {
			return node.clone();
		});
	}
		
	function MathSystem(str, targetRef) {
		stats.enter('parse');
		
		var nodes = MathSystem.strToAtomicNodes(str);
		stats.exit('parse').enter('merge');
		nodes = MathSystem.collapseNodes(nodes);
		stats.exit('merge').enter('plan');
		
		this.plan = new Plan(nodes, targetRef);
		
		stats.exit('plan');
	}

	MathSystem.strToAtomicNodes = function(str) {
		str = str.replace(/ /g, '');
		var temp = str.split('&'),
			nodes = [];
		temp.forEach(function(line) {
			var sides = line.split(parserRegex.comparator);
			if (sides[1] === '@=' && parserRegex.range.test(sides[2]) && parserRegex.id.test(sides[0])) {
				var temp = sides[2].slice(1, sides[2].length - 1).split(',');
				nodes.push(new Node(sides[0], temp[0], 'geq'), new Node(sides[0], temp[1], 'leq'));
			} else {
				nodes.push(new Node(sides[0], sides[2], compNames[sides[1]]));
			}
		});
		return nodes;
	};

	
	MathSystem.collapseNodes = function(nodes) {
		nodes = MathSystem.genericCollapse(nodes);
		nodes = MathSystem.matchRanges(nodes);
		nodes = MathSystem.pullDerivatives(nodes);
		nodes = MathSystem.inlineCalls(nodes);
		
		return nodes;
	};

	MathSystem.genericCollapse = function(nodes) {
		// the chaotic order is no good; it misses possible intermediate substitutions
		// should be:
		//   i-merge (extend supplies)
		//   e-merge (transform supplies)
		//   loop ^^ while e-merge possible
		
		var flag = true;
		while (flag) {
			flag = false;
			var i = 0;
			while (i < nodes.length) {
				var j = 0;
				while (j < nodes.length) {
					if (haveCommon(nodes[i].supplies, nodes[j].supplies) && Node.mergeable(nodes[i], nodes[j])) {
						nodes[i].merge(nodes[j]);
						if (nodes[j].mode !== 'eq')
							nodes.splice(j ,1);
						j = 0;
						flag = true;
					} else {
						j++;
					}
				}
				i++;
			}
		};
		
		return nodes;
	};

	// this should now have unbounded generation
	MathSystem.matchRanges = function(nodes) {
		var bNodes = nodes.filter(function(node) {
				return node.mode === 'geq';
			}),
			tNodes = nodes.filter(function(node) {
				return node.mode === 'leq';
			});
		
		bNodes.forEach(function(bnode) {
			var tnode = firstMatch(tNodes, function(tnode) {
					return bnode.supplies[0] === tnode.supplies[0];
				});
			
			if (isExisty(tnode)) {
				nodes.push(new Node(bnode, tnode));				
				nodes = setMinus(nodes, [bnode, tnode]);
				tNodes = setMinus(tNodes, [tnode]);
			} else {
				bnode.toImplicit();
			}
		});
		tNodes.forEach(function(tnode) {
			tnode.toImplicit();
		});
		
		// add implicitization for unmatched bord
		
		return nodes;
	};
	
	// these two are just plain ugly
	MathSystem.pullDerivatives = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			union(MathSystem.extractFunctions(node.body), MathSystem.extractVariables(node.body)).forEach(function(funcID) {
				if (funcID.match(/delta_[A-Za-z0-9]+_[A-Za-z0-9_]+/g)) {
					var temp = funcID.split('_'),
						fName = temp[1],
						over = temp.slice(2),
						def = nodes.filter(function(node) {
							return node.supplies[0] === fName;
						})[0];
					over.forEach(function(varName) {
						def = def.diff(varName);
					});
					def.supplies[0] = 'delta_' + def.supplies[0];
					newNodes.push(def);
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	MathSystem.inlineCalls = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			MathSystem.extractCalls(node.body).forEach(function(call) {
				var fname = MathSystem.extractFunctions(call)[0];
				if (!prefixes.hasOwnProperty(fname)) {
					var def = nodes.filter(function(node) {
							return node.supplies[0] === fname;
						})[0],
						subs = MathSystem.extractLiterals(call), // includes the funciton id
						newDef = def.body,
						versionName = subs.join('_');
					def.variables.forEach(function(vname, i) {
						newDef = inlineSubstitute(newDef, vname, subs[i + 1]);
					});
					newNodes.push(new Node(versionName, newDef, 'eq'));
					node = new Node(node.supplies[0], node.body.replace(call, versionName), 'eq');
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	
	MathSystem.extractCalls = function(str) {
		return (str.match(parserRegex.allCalls) || []).reduce(unique, []);
	};

	MathSystem.extractVariables = function(str) {
		return (str.match(parserRegex.variables) || []).reduce(unique, []);
	};

	MathSystem.extractLiterals = function(str) {
		return (str.match(parserRegex.literals) || []).reduce(unique, []);
	};

	MathSystem.extractFunctions = function(str) {
		return (str.match(parserRegex.functions) || []).reduce(unique, []);
	};

	
	MathSystem.formatFunction = function(str) {
		str = MathSystem.uncaret(str);
		str = str.replace(parserRegex.functions, function(match) {
			return prefixes.hasOwnProperty(match)? prefixes[match]: match;
		});	
		return str;		
	};


	// somewhat of a big issue:
	//   x @= [1, y] is not converted to implicit and can't be computed
	// in fact, it's not even parsed

	function Node(/*arguments*/) {
		if (arguments.length === 0) {
			Node.call(this, '', '', 'eq');
		} else if (arguments.length === 1) {
			var cloned = arguments[0];
			if (!cloned instanceof Node)
				throw new Error('node - cloning error');
			this.mode = cloned.mode;
			this.body = cloned.body;
			this.variables = cloned.variables.slice();
			this.requires = cloned.requires.slice();
			this.supplies = cloned.supplies.slice();
			//this.isBorder = cloned.isBorder;
		} else if (arguments.length === 2) {
			var node1 = arguments[0],
				node2 = arguments[1];
			if (!Node.mergeable(node1, node2))
				throw new Error('merge not possible ' + node1 + ' ' + node2);
				
			if (node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies)) {
				this.mode = 'eq';
				this.body = node1.body + (node1.supplies.length > 0 && node2.supplies.length > 0? ',': '') + node2.body;
				this.supplies = node1.supplies.concat(node2.supplies);
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq')) {
				Node.call(this, node1.clone().toImplicit(), node2.clone().toImplicit());
			} else if ((node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq')) {
				this.mode = node1.mode;
				this.body = (node1.mode === 'leq'? 'min': 'max') + '(' + node1.body + ',' +node2.body + ')';
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'geq' && node2.mode === 'leq') {
				this.mode = 'in';
				this.body = node1.body + ',' + node2.body;
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'implicit' && node2.mode === 'eq') {
				this.mode = 'implicit';
				this.body = node1.body;
				node2.supplies.forEach(function(name) {
					this.body = inlineSubstitute(this.body, name, node2.body);
				}.bind(this));
				this.variables = union(setMinus(node1.variables, node2.supplies), node2.variables);
			} else if (node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq')) {
				Node.call(this, node1, node2.clone().toImplicit());
			} else if (node1.mode === 'implicit' && node2.mode === 'implicit') {
				this.mode = 'implicit';
				this.variables = union(node1.variables, node2.variables);
				this.body = 'max(' + node1.body + ', ' + node2.body + ')';
			}
		} else if (arguments.length === 3) {
			var l = arguments[0],
				r = arguments[1],
				mode = arguments[2];
				
			if (parserRegex.id.test(l)) {
				this.mode = mode;
				this.body = r;
				this.variables = MathSystem.extractVariables(this.body);
				this.supplies = MathSystem.extractVariables(l);
			} else if (parserRegex.signature.test(l)) {
				this.mode = mode;
				var rVariables = MathSystem.extractVariables(r),
					lVariables = MathSystem.extractVariables(l);
				if (setMinus(rVariables, lVariables).length !== 0) // another test needed
					throw new Error('incorrect signature');
				this.variables = lVariables.slice();
				this.body = r;
				this.supplies = MathSystem.extractFunctions(l);
			} else {
				this.mode = 'implicit';
				this.body = Node.implicitize(l, r, mode);
				this.variables = MathSystem.extractVariables(this.body);
			}
		}
		
		this._f = null;
		if (this.mode === 'implicit') {
			this.requires = [];
			this.supplies = this.variables;
		} else if (this.mode === 'eq' || this.mode === 'leq' || this.mode === 'geq' || this.mode === 'in') {
			this.requires = this.variables;
		}
	}

	Node.mergeable = function(node1, node2) {
		if (node1 === node2)
			return false;
		var disjointEq = node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies),
			singleCommonArg = node1.supplies.length === 1 && node2.supplies.length === 1 && haveCommon(node1.supplies, node2.supplies),
			multipleDefinition = node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq'),
			rangeBoundCollapse = (node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq'),
			rangeBounds = node1.mode === 'geq' && node2.mode === 'leq',
			iSubs = node1.mode === 'implicit' && node2.mode === 'eq',
			iBound = node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq'),
			iMerge = node1.mode === 'implicit' && node2.mode === 'implicit';
		return disjointEq || iSubs || iBound || iMerge ||
			(singleCommonArg && (multipleDefinition || rangeBoundCollapse || rangeBounds));
	};

	Node.implicitize = function(l, r, mode) {
		if (mode === 'eq') {
			return '((' + l + ')-(' + r + '))^2'; // or should it be sum-of squares?
		} else if (mode === 'leq') {
			return '(' + l + ')-(' + r + ')';
		} else if (mode === 'geq') {
			return '(' + r + ')-(' + l + ')';
		}
	};

	Node.prototype.toImplicit = function() {
		if (this.type !== 'implicit' && this.supplies.length === 1) {
			this.variables = union(this.requires, this.supplies);
			this.requires = [];
			this.body = Node.implicitize(this.supplies[0], this.body, this.mode);
			this.mode = 'implicit';
		}
		return this;
	};

	Node.prototype.merge = function(otherNode) {
		Node.call(this, this, otherNode);
		return this;
	};

	Node.prototype.clone = function() {
		return new Node(this);
	};

	Node.prototype.diff = function(over) {
		if (this.mode !== 'eq')
			throw new Error('differentiation not possible');
		var diffBody = '((' + inlineSubstitute(this.body, over, '(' + over + '+ .001)') + ')-(' + this.body + '))/(.001)',
			temp = this.clone();
		temp.supplies = [this.supplies[0] + '_' + over];
		temp.body = diffBody;
		return temp;
	};

	Node.prototype.f = function() {
		var body = MathSystem.formatFunction(this.body);
		if (!isExisty(this._f)) {
			if (this.mode === 'eq') {
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'data[\'' + n + '\'][i]');
				});
				var output = this.supplies.map(function(n) { return 'data[\'' + n + '\'][i]'; }),
					input = [body];
				this._f = new Function('data', 'l', 'for (var i = 0; i < l; i++) {' + output.map(function(o, i) {
					return o + '=' + input[i] + ';'
				}) + '}');
			} else if (this.mode === 'in') {
				var sides = body.split(','),
					min = sides[0],
					max = sides[1];
				this._f = seq(min, max, this.supplies[0]);
			} else if (this.mode === 'implicit') {		
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'pt[' + i + ']');
				});
				this._f = traceZeroSet(new Function('pt', 'return ' + body), this.variables);
			}
		}
		return this._f;
	};


	function inlineSubstitute(body, name, sub) {
		return body.replace(new RegExp('\\b' + name + '\\b', 'g'), '(' + sub + ')');
	}

	MathSystem.uncaret = function(str) {
		while (str.indexOf('^') !== -1) {
			var powI = str.indexOf('^'),
				i = powI - 1,
				nest = 0;
			if (str[i] === ')') {
				nest = 0;
				do {
					if (str[i] === ')')
						nest++;
					else if (str[i] === '(')
						nest--;
					i--;
				} while (nest !== 0);
			}
			while (i >= 0 && /[a-zA-Z0-9_.]/.test(str[i]))
				i--;
			var baseI = i + 1;
			
			i = powI + 1;
			while (i <= str.length - 1 && /[a-zA-Z0-9_.]/.test(str[i]))
				i++;
				
			if (str[i] === '(') {
				nest = 0;
				do {
					if (str[i] === '(')
						nest++;
					else if (str[i] === ')')
						nest--;
					i++;
				} while (nest !== 0);
			}
			var expI = i;

			var prefix = str.substring(0, baseI),
				base = str.substring(baseI, powI),
				exponent = str.substring(powI + 1, expI),
				suffix = str.substring(expI, str.length);
			str = prefix + 'pow(' + base + ',' + exponent + ')' + suffix;
		}
		return str;
	};
	
	
	// exports
	
	_G.MathSystem = MathSystem;
	_G.Node = Node;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		parserConfig = _G.config.grafaryaz,
		stats = _G.stats,
		
		seq = _G.seq,
		traceZeroSet = _G.traceZeroSet,
		
		haveCommon = _G.haveCommon,
		isExisty = _G.isExisty,
		firstMatch = _G.firstMatch,
		union = _G.union,
		unique = _G.unique,
		setMinus = _G.setMinus,
		
		Plan = _G.Plan;

	stats.add('parse').add('merge').add('plan');
	// locals
	
	var prefixes = {
		sin: 'Math.sin',
		cos: 'Math.cos',
		sqrt: 'Math.sqrt',
		tan: 'Math.tan',
		pow: 'grafar.pow',
		min: 'Math.min',
		max: 'Math.max',
		exp: 'Math.exp',
		abs: 'Math.abs',
		log: 'Math.log'
	},
		regexTemplates = {
			number: '[+-]?[0-9]*\\.?[0-9]+',
			integer: '[+-]?[0-9]*',
			id: '[A-Za-z_]+[A-Za-z0-9_]*',
			postVar: '(?=$|[\\)+\\-*\\/\\^\\,])',
			postFunc: '(?=\\()'
		};
	regexTemplates.literal = '(?:' + regexTemplates.number + '|' + regexTemplates.id + ')';
	var	parserRegex = {
			range: new RegExp('^\\[' + regexTemplates.number + '\\,' + regexTemplates.number + '\\]$'),
			set: new RegExp('^\\{(?:' + regexTemplates.number + ',)*' + regexTemplates.number + '\\}$'),
			id: new RegExp('^' + regexTemplates.id + '$|^$'), // includes empty string
			variables: new RegExp(regexTemplates.id + regexTemplates.postVar, 'g'),
			functions: new RegExp(regexTemplates.id + regexTemplates.postFunc, 'g'),
			literals: new RegExp(regexTemplates.literal, 'g'),
			signature: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.id + ',)*' + regexTemplates.id + '\\)$'),
			call: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)$'),
			allCalls: new RegExp(regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)', 'g'), // call site this is called
			pds: new RegExp(regexTemplates.id + '\'' + regexTemplates.id, 'g'),
			//brackets: /[\[\]\{\}]/g,
			comparator: /(==|@=|<=|>=)/
		},
		compNames = (function() {
			var temp = {};
			temp['>='] = 'geq';
			temp['<='] = 'leq';
			temp['=='] = 'eq';
			temp['@='] = 'in';
			return temp;
		}());

	function snapNodeState(arr) {
		return arr.map(function(node) {
			return node.clone();
		});
	}
		
	function MathSystem(str, targetRef) {
		var nodes = MathSystem.strToAtomicNodes(str);
		nodes = MathSystem.collapseNodes(nodes);
		this.plan = new Plan(nodes, targetRef);
	}

	MathSystem.strToAtomicNodes = function(str) {
		str = str.replace(/ /g, '');
		var temp = str.split('&'),
			nodes = [];
		temp.forEach(function(line) {
			var sides = line.split(parserRegex.comparator);
			if (sides[1] === '@=' && parserRegex.range.test(sides[2]) && parserRegex.id.test(sides[0])) {
				var temp = sides[2].slice(1, sides[2].length - 1).split(',');
				nodes.push(new Node(sides[0], temp[0], 'geq'), new Node(sides[0], temp[1], 'leq'));
			} else {
				nodes.push(new Node(sides[0], sides[2], compNames[sides[1]]));
			}
		});
		return nodes;
	};

	
	MathSystem.collapseNodes = function(nodes) {
		nodes = MathSystem.genericCollapse(nodes);
		nodes = MathSystem.matchRanges(nodes);
		nodes = MathSystem.pullDerivatives(nodes);
		nodes = MathSystem.inlineCalls(nodes);
		
		return nodes;
	};

	MathSystem.genericCollapse = function(nodes) {
		// the chaotic order is no good; it misses possible intermediate substitutions
		// should be:
		//   i-merge (extend supplies)
		//   e-merge (transform supplies)
		//   loop ^^ while e-merge possible
		
		var flag = true;
		while (flag) {
			flag = false;
			var i = 0;
			while (i < nodes.length) {
				var j = 0;
				while (j < nodes.length) {
					if (haveCommon(nodes[i].supplies, nodes[j].supplies) && Node.mergeable(nodes[i], nodes[j])) {
						nodes[i].merge(nodes[j]);
						if (nodes[j].mode !== 'eq')
							nodes.splice(j ,1);
						j = 0;
						flag = true;
					} else {
						j++;
					}
				}
				i++;
			}
		};
		
		return nodes;
	};

	// this should now have unbounded generation
	MathSystem.matchRanges = function(nodes) {
		var bNodes = nodes.filter(function(node) {
				return node.mode === 'geq';
			}),
			tNodes = nodes.filter(function(node) {
				return node.mode === 'leq';
			});
		
		bNodes.forEach(function(bnode) {
			var tnode = firstMatch(tNodes, function(tnode) {
					return bnode.supplies[0] === tnode.supplies[0];
				});
			
			if (isExisty(tnode)) {
				nodes.push(new Node(bnode, tnode));				
				nodes = setMinus(nodes, [bnode, tnode]);
				tNodes = setMinus(tNodes, [tnode]);
			} else {
				bnode.toImplicit();
			}
		});
		tNodes.forEach(function(tnode) {
			tnode.toImplicit();
		});
		
		// add implicitization for unmatched bord
		
		return nodes;
	};
	
	// these two are just plain ugly
	MathSystem.pullDerivatives = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			union(MathSystem.extractFunctions(node.body), MathSystem.extractVariables(node.body)).forEach(function(funcID) {
				if (funcID.match(/delta_[A-Za-z0-9]+_[A-Za-z0-9_]+/g)) {
					var temp = funcID.split('_'),
						fName = temp[1],
						over = temp.slice(2),
						def = nodes.filter(function(node) {
							return node.supplies[0] === fName;
						})[0];
					over.forEach(function(varName) {
						def = def.diff(varName);
					});
					def.supplies[0] = 'delta_' + def.supplies[0];
					newNodes.push(def);
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	MathSystem.inlineCalls = function(nodes) {
		var newNodes = [];
		nodes.forEach(function(node) {
			node = node.clone();
			MathSystem.extractCalls(node.body).forEach(function(call) {
				var fname = MathSystem.extractFunctions(call)[0];
				if (!prefixes.hasOwnProperty(fname)) {
					var def = nodes.filter(function(node) {
							return node.supplies[0] === fname;
						})[0],
						subs = MathSystem.extractLiterals(call), // includes the funciton id
						newDef = def.body,
						versionName = subs.join('_');
					def.variables.forEach(function(vname, i) {
						newDef = inlineSubstitute(newDef, vname, subs[i + 1]);
					});
					newNodes.push(new Node(versionName, newDef, 'eq'));
					node = new Node(node.supplies[0], node.body.replace(call, versionName), 'eq');
				}
			});
			newNodes.push(node);
		});
		return newNodes;
	};

	
	MathSystem.extractCalls = function(str) {
		return (str.match(parserRegex.allCalls) || []).reduce(unique, []);
	};

	MathSystem.extractVariables = function(str) {
		return (str.match(parserRegex.variables) || []).reduce(unique, []);
	};

	MathSystem.extractLiterals = function(str) {
		return (str.match(parserRegex.literals) || []).reduce(unique, []);
	};

	MathSystem.extractFunctions = function(str) {
		return (str.match(parserRegex.functions) || []).reduce(unique, []);
	};

	
	MathSystem.formatFunction = function(str) {
		str = MathSystem.uncaret(str);
		str = str.replace(parserRegex.functions, function(match) {
			return prefixes.hasOwnProperty(match)? prefixes[match]: match;
		});	
		return str;		
	};


	// somewhat of a big issue:
	//   x @= [1, y] is not converted to implicit and can't be computed
	// in fact, it's not even parsed

	function Node(/*arguments*/) {
		if (arguments.length === 0) {
			Node.call(this, '', '', 'eq');
		} else if (arguments.length === 1) {
			var cloned = arguments[0];
			if (!cloned instanceof Node)
				throw new Error('node - cloning error');
			this.mode = cloned.mode;
			this.body = cloned.body;
			this.variables = cloned.variables.slice();
			this.requires = cloned.requires.slice();
			this.supplies = cloned.supplies.slice();
			//this.isBorder = cloned.isBorder;
		} else if (arguments.length === 2) {
			var node1 = arguments[0],
				node2 = arguments[1];
			if (!Node.mergeable(node1, node2))
				throw new Error('merge not possible ' + node1 + ' ' + node2);
				
			if (node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies)) {
				this.mode = 'eq';
				this.body = node1.body + (node1.supplies.length > 0 && node2.supplies.length > 0? ',': '') + node2.body;
				this.supplies = node1.supplies.concat(node2.supplies);
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq')) {
				Node.call(this, node1.clone().toImplicit(), node2.clone().toImplicit());
			} else if ((node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq')) {
				this.mode = node1.mode;
				this.body = (node1.mode === 'leq'? 'min': 'max') + '(' + node1.body + ',' +node2.body + ')';
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'geq' && node2.mode === 'leq') {
				this.mode = 'in';
				this.body = node1.body + ',' + node2.body;
				this.supplies = node1.supplies.slice();
				this.variables = union(node1.variables, node2.variables);
			} else if (node1.mode === 'implicit' && node2.mode === 'eq') {
				this.mode = 'implicit';
				this.body = node1.body;
				node2.supplies.forEach(function(name) {
					this.body = inlineSubstitute(this.body, name, node2.body);
				}.bind(this));
				this.variables = union(setMinus(node1.variables, node2.supplies), node2.variables);
			} else if (node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq')) {
				Node.call(this, node1, node2.clone().toImplicit());
			} else if (node1.mode === 'implicit' && node2.mode === 'implicit') {
				this.mode = 'implicit';
				this.variables = union(node1.variables, node2.variables);
				this.body = 'max(' + node1.body + ', ' + node2.body + ')';
			}
		} else if (arguments.length === 3) {
			var l = arguments[0],
				r = arguments[1],
				mode = arguments[2];
				
			if (parserRegex.id.test(l)) {
				this.mode = mode;
				this.body = r;
				this.variables = MathSystem.extractVariables(this.body);
				this.supplies = MathSystem.extractVariables(l);
			} else if (parserRegex.signature.test(l)) {
				this.mode = mode;
				var rVariables = MathSystem.extractVariables(r),
					lVariables = MathSystem.extractVariables(l);
				if (setMinus(rVariables, lVariables).length !== 0) // another test needed
					throw new Error('incorrect signature');
				this.variables = lVariables.slice();
				this.body = r;
				this.supplies = MathSystem.extractFunctions(l);
			} else {
				this.mode = 'implicit';
				this.body = Node.implicitize(l, r, mode);
				this.variables = MathSystem.extractVariables(this.body);
			}
		}
		
		this._f = null;
		if (this.mode === 'implicit') {
			this.requires = [];
			this.supplies = this.variables;
		} else if (this.mode === 'eq' || this.mode === 'leq' || this.mode === 'geq' || this.mode === 'in') {
			this.requires = this.variables;
		}
	}

	Node.mergeable = function(node1, node2) {
		if (node1 === node2)
			return false;
		var disjointEq = node1.mode === 'eq' && node2.mode === 'eq' && !haveCommon(node1.supplies, node2.supplies),
			singleCommonArg = node1.supplies.length === 1 && node2.supplies.length === 1 && haveCommon(node1.supplies, node2.supplies),
			multipleDefinition = node1.mode === 'eq' && (node2.mode === 'leq' || node2.mode === 'geq' || node2.mode === 'eq'),
			rangeBoundCollapse = (node1.mode === 'leq' && node2.mode === 'leq') || (node1.mode === 'geq' && node2.mode === 'geq'),
			rangeBounds = node1.mode === 'geq' && node2.mode === 'leq',
			iSubs = node1.mode === 'implicit' && node2.mode === 'eq',
			iBound = node1.mode === 'implicit' && (node2.mode === 'leq' || node2.mode === 'geq'),
			iMerge = node1.mode === 'implicit' && node2.mode === 'implicit';
		return disjointEq || iSubs || iBound || iMerge ||
			(singleCommonArg && (multipleDefinition || rangeBoundCollapse || rangeBounds));
	};

	Node.implicitize = function(l, r, mode) {
		if (mode === 'eq') {
			return '((' + l + ')-(' + r + '))^2'; // or should it be sum-of squares?
		} else if (mode === 'leq') {
			return '(' + l + ')-(' + r + ')';
		} else if (mode === 'geq') {
			return '(' + r + ')-(' + l + ')';
		}
	};

	Node.prototype.toImplicit = function() {
		if (this.type !== 'implicit' && this.supplies.length === 1) {
			this.variables = union(this.requires, this.supplies);
			this.requires = [];
			this.body = Node.implicitize(this.supplies[0], this.body, this.mode);
			this.mode = 'implicit';
		}
		return this;
	};

	Node.prototype.merge = function(otherNode) {
		Node.call(this, this, otherNode);
		return this;
	};

	Node.prototype.clone = function() {
		return new Node(this);
	};

	Node.prototype.diff = function(over) {
		if (this.mode !== 'eq')
			throw new Error('differentiation not possible');
		var diffBody = '((' + inlineSubstitute(this.body, over, '(' + over + '+ .001)') + ')-(' + this.body + '))/(.001)',
			temp = this.clone();
		temp.supplies = [this.supplies[0] + '_' + over];
		temp.body = diffBody;
		return temp;
	};

	Node.prototype.grad = function() {
		return new Node();
	};

	Node.prototype.toString = function() {
		return '(' + this.requires.join(', ') + ') -> (' + this.supplies.join(',') + ') : ' + this.body + ' ' + this.mode;
	};

	Node.prototype.f = function() {
		var body = MathSystem.formatFunction(this.body);
		if (!isExisty(this._f)) {
			if (this.mode === 'eq') {
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'data[\'' + n + '\'][i]');
				});
				var output = this.supplies.map(function(n) { return 'data[\'' + n + '\'][i]'; }),
					input = [body];
				this._f = new Function('data', 'l', 'for (var i = 0; i < l; i++) {' + output.map(function(o, i) {
					return o + '=' + input[i] + ';'
				}) + '}');
			} else if (this.mode === 'in') {
				var sides = body.split(','),
					min = sides[0],
					max = sides[1];
				this._f = seq(min, max, this.supplies[0]);
			} else if (this.mode === 'implicit') {		
				this.variables.forEach(function(n, i) {
					body = body.replace(new RegExp('\\b' + n + '\\b', 'g'), 'pt[' + i + ']');
				});
				this._f = traceZeroSet(new Function('pt', 'return ' + body), this.variables);
			}
		}
		return this._f;
	};


	function inlineSubstitute(body, name, sub) {
		return body.replace(new RegExp('\\b' + name + '\\b', 'g'), '(' + sub + ')');
	}

	MathSystem.uncaret = function(str) {
		while (str.indexOf('^') !== -1) {
			var powI = str.indexOf('^'),
				i = powI - 1,
				nest = 0;
			if (str[i] === ')') {
				nest = 0;
				do {
					if (str[i] === ')')
						nest++;
					else if (str[i] === '(')
						nest--;
					i--;
				} while (nest !== 0);
			}
			while (i >= 0 && /[a-zA-Z0-9_.]/.test(str[i]))
				i--;
			var baseI = i + 1;
			
			i = powI + 1;
			while (i <= str.length - 1 && /[a-zA-Z0-9_.]/.test(str[i]))
				i++;
				
			if (str[i] === '(') {
				nest = 0;
				do {
					if (str[i] === '(')
						nest++;
					else if (str[i] === ')')
						nest--;
					i++;
				} while (nest !== 0);
			}
			var expI = i;

			var prefix = str.substring(0, baseI),
				base = str.substring(baseI, powI),
				exponent = str.substring(powI + 1, expI),
				suffix = str.substring(expI, str.length);
			str = prefix + 'pow(' + base + ',' + exponent + ')' + suffix;
		}
		return str;
	};
	

	function ductParse(str, params, section) {
		var fixed = setMinus(Object.keys(params).filter(function(r) {return !Array.isArray(params[r])}), ['x', 'y', 'z']),
			isSection = isExisty(section);
		for (var i = 0; i < fixed.length; i++)
			str = inlineSubstitute(str, fixed[i], params[fixed[i]]);
		str = str.replace(/<[^=]/g, '<=').replace(/>[^=]/g, '>=');
		var constraints = str.split('&');
		for (var i = 0; i < constraints.length; i++) {
			var sides = constraints[i].split(/(<=|>=|==)/g);
			if (sides[1] === '==')
				constraints[i] = 'abs(' + sides[0] + '-(' + sides[2] + '))';
			else if (sides[1] === '>=')
				constraints[i] = sides[2] + '-' + sides[0];
			else if (sides[1] === '<=')
				constraints[i] = sides[0] + '-' + sides[2];
			constraints[i] = MathSystem.formatFunction(constraints[i]);
		}
		var body = constraints.length > 1? 'Math.max(' + constraints.join(',') + ')': constraints[0],
			vars = union(MathSystem.extractVariables(body), ['x', 'y', 'z']);
		for (var i = 0; i < vars.length; i++)
			body = inlineSubstitute(body, vars[i], 'pt[' + i + ']');
		var coref = new Function('pt', 'return ' + body);
		var f = traceZeroSet(coref, vars);
		return f;
	}
	
	// exports
	
	_G.MathSystem = MathSystem;
	_G.ductParse = ductParse;
	_G.Node = Node;
}(this));'use strict';

(function(global) {	
	var _G = global.grafar,
		union = _G.union,
		Table2 = _G.Table2,
		isExisty = _G.isExisty,
		Generator = _G.Generator,
		generators = _G.generators,
		MathSystem = _G.MathSystem;
	
	
	function Cont() {
		Generator.call(this);
	}
	
	Cont.prototype = new Generator();
	
	Cont.prototype.set = function(str, table) {
		table = table || this.table;
		
		if (isExisty(table)) {
			// TODO catchall target if table missing
			this.actions = new MathSystem(str, table.requests.filter(function(n) { return n !== '$i'; })).plan.sequence();
			this.execute(table);
			table.dispatch('update');		
			// check async
			table.dropAll();
		}		
			
		return this;
	};
		
	
	// exports
	
	generators.Cont = Cont;
}(this));'use strict';

(function(global) {
	var _G = global.grafar;
	
	
	function Timer(scale) {
		this.start = Date.now();
		this.scale = scale || 1;
	}
	
	Timer.prototype.get = function() {
		return (Date.now() - this.start) / this.scale;
	};
	
	Timer.prototype.reset = function() {
		Timer.call(this, this.scale);
		return this;
	};
		
		
	function DiscreteTimer(step) {
		this.counter = 0;
		this.step = step || 1;
	}
	
	DiscreteTimer.prototype.get = function() {
		var temp = this.counter;
		this.counter += this.step;
		return temp;
	};
	
	DiscreteTimer.prototype.reset = function() {	
		DiscreteTimer.call(this, this.scale);
	};
	
	
	function Process(timer, callback) {
		this.timer = timer;
		this.active = true;
		var self = this;
		this.timed = function() {
			callback(self.timer.get());
			if (self.active)
				window.requestAnimationFrame(self.timed);
		};
		return this;
	}
	
	Process.prototype.start = function() {
		this.active = true;
		this.timer.reset();
		this.timed();
		return this;
	};
	
	Process.prototype.stop = function() {
		this.active = false;
		return this;
	};
	
	
	// export
	
	_G.Timer = Timer;
	_G.DiscreteTimer = DiscreteTimer;
	_G.Process = Process;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		Detector = global.Detector,
		pool = _G.pool,
		THREE = global.THREE,
		Stats = global.Stats,
		config = _G.config,
		makeID = _G.makeID,
		Observable = _G.Observable,
		isExisty = _G.isExisty;
	
	var panels = _G.panels,
		renderMode = Detector.webgl? 'webgl': Detector.canvas? 'canvas': 'none',
		Renderer = {
			webgl: THREE.WebGLRenderer.bind(null, {antialias: config.antialias}),
			canvas: THREE.CanvasRenderer,
			none: Error.bind(null, 'no 3D support')
		}[renderMode];
			
	function Panel(container, opts) {
		Observable.call(this);
	
		opts = opts || {};		
		panels.push(this);
		
		container = container || config.container;
		var containerStyle = window.getComputedStyle(container),
			bgcolor = containerStyle.backgroundColor,
		    width = Math.max(parseInt(containerStyle.width), config.minPanelWidth),
		    height = Math.max(parseInt(containerStyle.height), config.minPanelHeight);

		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
		this.camera.position.set(-4, 4, 5);
		
		this.scene = new THREE.Scene();
		var pointLight = new THREE.PointLight(0xaaaaff);
		pointLight.position.set( 0, 20, 10 );
		this.scene.add( pointLight );
		
		this.renderer = new Renderer();
		this.renderer.antialias = config.antialias;
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(bgcolor, 1);
		
		this.controls = new THREE.OrbitControls(this.camera, container);
		
		this.setAxes(config.axes);
		
		this.setContainer(container);
		
		if (config.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		} else {
			this.stats = {update: function() {}};
		}
	}
	
	Panel.prototype = new Observable();
	
	Panel.prototype.setContainer = function(container) {
		container.appendChild(this.renderer.domElement);
		return this;
	};
	
	Panel.prototype.update = function() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.stats.update();
	};

	Panel.prototype.drawAxes = function (len) {
		if (!isExisty(this.axisObject)) {
			this.axisObject = new THREE.Object3D();
						
			var axisGeometry = new THREE.BufferGeometry();
			axisGeometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 18), 3));
			this.axisObject.add(new THREE.Line(
				axisGeometry, 
				new THREE.LineBasicMaterial({color: 0x888888}), 
				THREE.LinePieces
			));
			
			for (var i = 0; i < 3; i++) {
				var geometry = new THREE.BufferGeometry();
				geometry.addAttribute('position', new THREE.BufferAttribute(axisGeometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
				this.axisObject.add(new THREE.PointCloud(geometry, new THREE.PointCloudMaterial()));
			}
			
			this.scene.add(this.axisObject);
		}		
		
		if (isExisty(len))
			setAxisGeometry(this.axisObject.children[0].geometry.getAttribute('position').array, len);
		this._axes.forEach(function(axisId, i) {
			drawTextLabel(this.axisObject.children[i + 1].material, axisId || '');
		}.bind(this));
		
		return this;
	};
		
	Panel.prototype.setAxes = function(axisNames) {
		axisNames = axisNames.filter(function(n) {
				return typeof(n) === 'string';
			})
			.slice(0, 3);
		
		this._axes = [axisNames[1], axisNames[2], axisNames[0]];
		if (axisNames.length === 3) {
			this.controls.noRotate = false;
			this.controls.noPan = false;
			this.camera.up.set(0, 1, 0);
		} else if (axisNames.length === 2) {
			this.controls.noRotate = true;
			this.controls.noPan = true;
			this.camera.position.set(0, 5); // preserve distance or something, maybe smooth rotation
			this.camera.up.set(1, 0, 0);
		} else {
			// 1 or >3 axes leads to what?
		}
			
		this.drawAxes(2);
		Object.getOwnPropertyNames(_G.graphs).forEach(function(graphName) {
			var graph = _G.graphs[graphName];
			if (graph.panel === this)
				graph.setPanel(this);
		}.bind(this));
		
		return this;
	};
		
	
	function setAxisGeometry(posArray, length) {
		for (var i = 0; i < 3; i++) {
			posArray[7 * i] = -length;
			posArray[7 * i + 3] = length;
		}
		return posArray;
	}
	
	function drawTextLabel(mat, str) {
		var memo = {},
			fontSizePx = 21,
			baselineOffsetPx = 0.15 * fontSizePx;
		
		drawTextLabel = function(mat, str) {
			if (!memo.hasOwnProperty(str)) {
				var canvas = document.createElement('canvas'),
					context = canvas.getContext('2d');
				
				context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
				
				var computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
				canvas.width = computedSize;
				canvas.height = computedSize;
				
				context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
				context.fillStyle = '#444444';
				context.textAlign = 'center';
				context.fillText(str, Math.floor(computedSize / 2), Math.ceil(computedSize / 2) - baselineOffsetPx);
				 
				memo[str] = {
					size: computedSize, /*config.labelSize / fontSizePx * */
					map: new THREE.Texture(canvas)
				};
			}
			 
			var memoEntry = memo[str]; 
			mat.size = memoEntry.size;
			mat.transparent = true;
			mat.sizeAttenuation = false;
			mat.map = memoEntry.map.clone();
			mat.map.needsUpdate = true;
			
			return mat;
		};
		return drawTextLabel(mat, str);
	}
	
	
	_G.Panel = Panel;
}(this));'use strict';

(function(global) {	
	var _G = global.grafar,
		THREE = global.THREE,
		makeID = _G.makeID,
		Style = _G.Style,
		Panel = _G.Panel,
		config = _G.config,
		isExisty = _G.isExisty,
		Observable = _G.Observable,
		pool = _G.pool;
	
	var graphs = {};
	
	// *** constructor ***
	function Graph(gConfig) {
		Observable.call(this);
	
		gConfig = gConfig || {};
		
		this.id = gConfig.id || makeID(graphs);		
		graphs[this.id] = this;
			
		this.parent = null;
		this.children = [];
			
		this.panel = null;
		this.style = this.id !== config.rootGraphId? graphs[config.rootGraphId].style: new Style();
		this.hidden = null;
			
		var geometry = new THREE.BufferGeometry();		
		geometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 0), 3));
		geometry.addAttribute('index', new THREE.BufferAttribute(pool.get(Uint32Array, 0), 2));
			
		this.object = new THREE.Object3D()
			.add(new THREE.PointCloud(geometry, this.style.getParticleMaterial(this.id)))
			.add(new THREE.Line(geometry, this.style.getLineMaterial(this.id), THREE.LinePieces));
			
		this.setup(gConfig);
			
		return this;
	}
	
	Graph.prototype = new Observable();

	
	// data interface
	
	function AttributeWrapper(attribute, names) {
		this.names = names;
		this.target = attribute;
	}
	
	AttributeWrapper.prototype = {
		get array () {
			return this.target.array;
		},
		get length () {
			return this.target.array.length;
		},
		set length (val) {
			var oldArr = this.target.array,
				oldVal = oldArr.length;
			if (val !== oldVal) {
				var temp = pool.get(oldArr.constructor, val);
				// do we really need to copy?
				temp.set(oldArr.subarray(0, Math.min(oldVal, val)));
				pool.push(this.target.array);
				this.target.array = temp;
			}
		},
		update: function() {
			this.target.needsUpdate = true;
			return this;
		}
	};
	
	Graph.prototype.dataInterface = function() {
		var objects = this.object.children,
			panel = this.query('panel');
		this._dataInterface = this._dataInterface || {
			buffers: [
				new AttributeWrapper(objects[1].geometry.getAttribute('position'), isExisty(panel)?  panel._axes: []),
				new AttributeWrapper(objects[1].geometry.getAttribute('index'), ['$i'])
			]
		};
		return this._dataInterface;
	};
	
	
	// the new interface 
	
	Graph.prototype.data = function(table) {
		this.dataInterface().buffers.forEach(function(buffer) {
			table.postRequest(buffer.names);
			
			if (buffer.names.indexOf('$i') === -1)
				table.on('update', function() {
					buffer.length = table.length * buffer.names.length;  // look out for 2D -- all is OK, but still
					table.select(buffer.names, buffer.array);
					buffer.update();
				});
			else
				table.on('update', function() {
					buffer.length = table.indexBufferSize();
					table.computeIndexBuffer(buffer.array);
					buffer.update();
				});
		});
		
		return this;
	};
	
	Graph.prototype.enable = function(attr, alias) {
	};
	
	Graph.prototype.disable = function(attr, alias) {
	};
	
	
	// *** setters ***
	
	Graph.prototype.addChild = function(child) {
		this.children.push(child);
		return this;
	};
	
	Graph.prototype.removeChild = function(child) {
		this.children.splice(this.children.indexOf(child), 1);
		return this;
	};
	
	Graph.prototype.setParent = function(parent) {
		if (isExisty(this.parent))
			this.parent.removeChild(this);
		
		if (this.id === config.rootGraphId)
			parent = null;
		else if (!isExisty(parent))
			parent = graphs[config.rootGraphId];
		
		this.parent = parent;
		if (isExisty(this.parent))
			this.parent.addChild(this);
		
		this.setHiding();
		this.setPanel();
		this.setStyle();
			
		return this;
	};
	
	Graph.prototype.setPanel = function(panel) {
		if (this.query('panel'))
			this.query('panel').scene.remove(this.object);
			
		if (panel instanceof Panel)
			this.panel = panel;
		
		panel = this.query('panel');
		if (isExisty(panel)) {
			panel.scene.add(this.object);		
			// woah!
			this.dataInterface().buffers[0].names = panel._axes;
		}
		
		this.children.forEach(function(child) {
			child.setPanel();
		});
		
		return this;
	};
	
	Graph.prototype.setHiding = function(hide) {
		if (isExisty(hide))
			this.hidden = hide;
		this.object.visible = !this.query('hidden');
		
		this.children.forEach(function(child) {
			child.setHiding();
		});		
		return this;
	};
	
	Graph.prototype.setStyle = function(newStyle) {
		// this.style.drop();
		
		if (isExisty(newStyle)) {
			this.style = newStyle;
		} else if (this.id !== '$') {
			this.style = this.parent.style;
		} else {
			this.style = new Style();
		}
		this.object.children[0].material = this.style.getParticleMaterial(this.id);
		this.object.children[1].material = this.style.getLineMaterial(this.id);
		
		this.children.forEach(function(child) {
			child.setStyle();
		});
		return this;
	};
	
	Graph.prototype.setup = function(config) {
		config = config || {};
		
		this.setParent(config.parent);
		this.setPanel(config.panel);
		this.setStyle(config.style);
		this.setHiding(config.hide);
		
		return this;
	};
	
	
	// *** inheritance ***
	
	Graph.prototype.query = function(key) {
		var path = key.split('.'), temp = this;
		for (var i = 0; i < path.length; i++)
			if (isExisty(temp[path[i]]))
				temp = temp[path[i]];
			else if (this.parent)
				return this.parent.query(key);
			else
				return null;
		return temp;
	};

	
	// *** default (root) graph ***
	// don't use "new" for side effects
	new Graph({
		id: config.rootGraphId,
		style: new Style(),
		hide: false
	});
	
	
	// export
	
	_G.graphs = graphs;
	_G.Graph = Graph;
}(this));(function(global) {	
	var _G = global.grafar || (global.grafar = {});
	
	var demos = {		
		explicit: [
			'sqrt(x^2+y^2)',
			'exp(x*y)',
			'cos(exp(x*y))',
			'exp(-1/(x^2+y^2))',
			'(x^3+y^4)^(1/3)',
			'sin(exp(x+y)+(x^3+y^3)^(1/3))',
			'cos((x*y)^(1/3))',
			'x*sqrt(.3+(y^2)^(1/3))',
			'x*abs(y)+y*abs(x)',
			'(2*y/(x^2+y^2-1))/5',
			'(x^2*y^2)/(x^2*y^2+(x-y)^2)',
			'(x*y*(x-y)^2)/(x+y)^2',
			'(x^2+y^2)^(x^2*y^2)',
			'x^2*y/(y^2+x^4)',
			'x^2+y^2-x*y',
			'x^2-(y-1)^2',
			'x*y*log(x^2+y^2)',
			'(x*y)^(1/3)',
			'(x+y)/3*sin(5/x)*sin(5/y)',
			'sin(x*y)/x',
			'x^y'
		],
		implicit2: [
			'x^2+y^2=0',
			'1/(x^2+y^2)=0'
		],
		implicit3: [
		],
		systems:[
		],
		vectorFields: [
		],
		paramCurves2: [
		],
		paramCurves3: [
		],
		paramSurfs: [
		],
		complex: [
		]
	};

	
	// export
	
	_G.demos = demos;
}(this));(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	_G.UI = {};
		
	// grafar-chainable constructor
	_G.ui = function(mockup, opts) {
		opts = opts || {};
		var container = opts.container || document;
		if (typeof(container) === 'string')
			container = document.getElementById(container);
		if (mockup instanceof Array)
			mockup = {init: mockup, type: 'group'};
		
		this.UI.push(mockup, container);
		
		return this;
	};
	
	// methods
	_G.UI.push = function(mockup, parent) {
		var id = mockup.id || _G.makeID(this),
			type = mockup.type,
			col = mockup.col,
			init = mockup.init,
			bind = mockup.bind,
			temp;
		
		if (type === 'label')
			temp = new Label(init);
		else if (type === 'br')
			temp = document.createElement('br');
		else if (type === 'select')
			temp = new Select(init);
		else if (type === 'checkbox')
			temp = new Checkbox(init);
		else if (type === 'number')
			temp = new NumberInput(init, mockup.step);
		else if (type === 'vector')
			temp = new VectorInput(init, bind);
		else if (type === 'text')
			temp = new TextInput(init);
		else if (type === 'group')
			temp = new Group(init);
			
		parent.appendChild(temp);
		if (col) temp.style.background = col;
		if (bind) temp.addEventListener('change', bind);
		this[id] = temp;
		temp.id = id;
		
		return _G.UI;
	}
		
	_G.UI.hide = function(id) {
		if (this[id])
			this[id].style.display = 'none';
		return _G.UI;
	}
	
	_G.UI.show = function(id) {
		if (this[id])
			this[id].style.display = 'block';
		return _G.UI;
	}
	
	_G.UI.remove = function(id) {
		if (this[id]) {
			this[id].parentNode.removeChild(this[id]);
			while (this[id].firstChild)
				if (this[id].firstChild.id)
					_G.UI.remove(this[id].firstChild.id);
				else
					this[id].removeChild(this[id].firstChild);
			this[id] = null;
		}
		return _G.UI;
	}
		
	// field constructors
	function NumberInput(val, step) {
		step = step || .03;
		var temp = document.createElement('input');		
		temp.className = 'num';
		temp.size = '4';
		temp.type = 'number';
		temp.value = val;
		temp.step = step;
		temp.onkeypress = function(key) {
			if (key.keyCode === 40) {
				temp.value = parseFloat(temp.value) - step;
				triggerEvent('change', temp);
			} else if (key.keyCode === 38) {
				temp.value = (parseFloat(temp.value) + step).toFixed(2);
				triggerEvent('change', temp);
			}
		};
		temp.__defineGetter__('val', function() {
			return parseFloat(this.value);
		});
		return temp;
	};
	
	function VectorInput(values, bind) {
		var temp = document.createElement('div'),
		    inputReference = [];
		temp.style['display'] = 'inline';
		temp.appendChild(document.createTextNode('('));
		for (var j = 0; j < values.length; j++) {
			if (j)
				temp.appendChild(document.createTextNode(', '));
			var temp2 = NumberInput(values[j], .03);
			if (bind)
				temp2.addEventListener('change', bind);
			temp.appendChild(temp2);
			inputReference.push(temp2);
		}
		temp.appendChild(document.createTextNode(')'));
		temp.__defineGetter__('val', function() {
			return inputReference.map(function(e) {return parseFloat(e.value)});
		});
		return temp;
	}
	
	function TextInput(text) {
		var temp = document.createElement('input');
		temp.type = 'text';
		temp.value = init;
		return temp;
	}
	
	function Group(elements) {
		var temp = document.createElement('ul');
		temp.className = 'grafar_ui_subpanel';
		for (var j = 0; j < elements.length; j++)
			_G.UI.push(elements[j], temp);
		return temp;
	}
	
	function Label(val) {
		var temp = document.createElement('span');
		temp.className = 'grafar_ui_label';	
		temp.appendChild(document.createTextNode(val));
		temp.__defineSetter__('val', function(newText) {
			this.nodeValue = newText;
		});
		return temp;
	}
	
	function Select(options) {		
		var temp = document.createElement('select');
		for (var j = 0; j < options.length; j++)
			temp.options[j] = new Option(options[j]);
		temp.__defineGetter__('val', function() {
			return this.selectedIndex;
		});
		return temp;
	}
	
	function Checkbox(val) {
		var temp = document.createElement('input');
		temp.type = 'checkbox';
		temp.checked = val;
		temp.__defineGetter__('val', function() {
			return this.checked;
		});
		return temp;
	}
	
	// utilities
	function triggerEvent(type, element) {
		if ('createEvent' in document) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(type, false, true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent('on' + type);
		}
	}
}(this));