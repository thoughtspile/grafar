'use strict';

(function(global) {
	var _G = (global.grafar = {
            version: '4.01r'
        }),
		panels = [];
				
	var config = {
		debug: false,
		
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
	
}(this));(function(global){
	var grafar = global.grafar;
    
    
    var wrapFn = function(fn) {
        var nargfn = nListMap(fn.length);
        var boundfn = function(src, target, len) {
            nargfn(fn, src, target, len);
        };
        return boundfn;
    };
        
    var uniformFn = function(val) {
        return function(src, target, len) {
            for (var i = 0; i < len; i++)
                target[i] = val;
        };
    };
        
    var nListMap = function(nargs) {
        var application = '';
        var getvals = '';//var srcdata = [';
        for (var i = 0; i < nargs; i++) {
            //application += 'srcdata[' + i + '][i]';
            application += 'srcdata_' + i + '[i]';
            //getvals += 'src[' + i + '].value()';
            getvals += 'var srcdata_' + i + ' = src[' + i + '].value();';
            if (i !== nargs - 1) {
                application += ', ';
                //getvals += ', ';
            }
        }
        //getvals += '];\n';
        console.log(getvals + 
            'for (var i = 0; i < len; i++)\n' + 
            '  target[i] = fn(' + application + ');');
        return new Function('fn', 'src', 'target', 'len', 
            getvals + 
            'for (var i = 0; i < len; i++)\n' + 
            '  target[i] = fn(' + application + ');');
    };
    
    
    grafar.wrapFn = wrapFn;
    grafar.uniformFn = uniformFn;
    grafar.nListMap = nListMap;
}(this));'use strict';

(function(global) {
	var _G = global.grafar;
	
			
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
	
	
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.asArray = strToArray;
}(this));(function(global) {
	var _G = global.grafar,
		isExisty = _G.isExisty;
	
	
	var arrayPool = {};
	
	arrayPool.pool = {};
		
	arrayPool.get = function(Constructor, length) {
		var classKey = Constructor.toString(),
			constructorKey = length.toString(),
			classPool = this.pool[classKey],
			temp = null;
		if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0)
			temp = classPool[constructorKey].pop();
		else
			temp = new Constructor(length);
		return temp;
	};
		
	arrayPool.push = function(obj) {
		var classKey = obj.constructor.toString(),
			constructorKey = obj.length.toString();
			
		if (!isExisty(this.pool[classKey]))
			this.pool[classKey] = {};
		if (!isExisty(this.pool[classKey][constructorKey]))
			this.pool[classKey][constructorKey] = [];
			
		this.pool[classKey][constructorKey].push(obj);
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

		
	_G.zeroVector = zeroVector;
	_G.dot = dot;
	_G.norm = norm;
	_G.dist = dist;
}(this));'use strict';

(function(global) {
	var _G = global.grafar,
		dot = _G.dot,
		norm = _G.norm,
		arraySum = _G.arraySum,
		arrayTimes = _G.arrayTimes,
		config = _G.config.grafaryaz;
	
	
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
		
	function ints(m, name) {
		m = Number(m);
		return function(data, l, extras) {
			for (var i = 0; i < l; i++)
				data[name][i] = m + i;
			extras.continuous = false;
		};
	}
	
    function constant(val, name) {
        return function(data, l, extras) {
			for (var i = 0; i < l; i++)
				data[name][i] = val;
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
    _G.constant = constant;
	_G.seq = seq;
	_G.logseq = logseq;
	_G.traceZeroSet = traceZeroSet;
	_G.pow = pow;
}(this));'use strict';

(function(global) {
	var _G = global.grafar;
    

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
	
    function blockRepeat(source, blockSize, blockCount, repCount, target) {
        if (blockCount > 50) {
            for (var i = blockCount - 1; i >= 0; i--) {
                var baseS = i * blockSize;
                var baseTT = i * repCount;
                for (var k = 0; k < repCount; k++) {
                    var baseT = (baseTT + k) * blockSize;
                    for (var j = 0; j < blockSize; j++)
                        target[baseT + j] = source[baseS + j];
                }
            }
		} else if (blockCount > 10) {
            var buffer = new Float32Array(blockSize);
            for (var i = blockCount - 1; i >= 0; i--) {
                for (var j = 0; j < blockSize; j++)
                    buffer[j] = source[i * blockSize + j];
                var baseT = i * repCount * blockSize;
                for (var k = 0; k < repCount; k++) {
                    target.set(buffer, baseT);
                    baseT += blockSize;
                }
            }
        } else {
            for (var i = blockCount - 1; i >= 0; i--) {
                var buffer = source.subarray(i * blockSize, (i + 1) * blockSize);
                for (var k = 0; k < repCount; k++)
                    target.set(buffer, (i * repCount + k) * blockSize);
            }
        }
    };
    
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
    
    function Buffer() {
        this.array = new Float32Array(0);
        this.length = 0;
    }
    
    
    _G.Buffer = Buffer;
	_G.arraySum = arraySum;
	_G.arrayTimes = arrayTimes;
	_G.incArray = incArray;
	_G.timesArray = timesArray;
	_G.repeatArray = repeatArray;
	_G.blockRepeat = blockRepeat;
	_G.repeatPoints = repeatPoints;
}(this));'use strict';

(function(global) {	
	var _G = global.grafar,
		Color = global.Color,
		THREE = global.THREE,
		isExisty = _G.isExisty,
		config = _G.config,
		makeID = _G.makeID;
		
	var styles = {};
    
	
	function Style(init) {		
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
	
    Style.randColor = function() {
        var rgb = Color.convert({
                l: 60,
                a: -100 + Math.floor(200 * Math.random()),
                b: -100 + Math.floor(200 * Math.random())
            }, 'rgb');
        return new THREE.Color('rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
    };
    
    Style.matHelper = function(type, col) {
        if (!isExisty(col))
            col = Style.randColor();
        if (type === 'point')
            return new THREE.PointCloudMaterial({
                size: config.particleRadius, 
                transparent: true, 
                opacity: 0.5, 
                sizeAttenuation: false,
                color: col
            });
        else if (type === 'line')
            return new THREE.LineBasicMaterial({
                color: col
            });            
        else if (type === 'mesh')
            return new THREE.MeshLambertMaterial({
                side: THREE.DoubleSide,
                transparent: true,
                opacity: .5,
                depthWrite: false,
                color: col
                //depthTest: false
            });
    };
    
    
	Style.prototype.update = function(styleChanges) {
		Object.getOwnPropertyNames(styleChanges || {}).forEach(function(name) {
			if (this.hasOwnProperty(name))
				this[name] = styleChanges[name];
		}.bind(this));
		
		return this;
	};
	
    
	_G.styles = styles;
	_G.Style = Style;
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
		unique = _G.unique;
	
	
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
			postVar: '(?=$|[\\+\\s-*/^,)])',
			postFunc: '(?=\\()'
		};
	regexTemplates.literal = '(?:' + regexTemplates.number + '|' + regexTemplates.id + ')';

	
	function Constraint(what, using, mapping, extras) {
		this.what = what;
		this.using = using || [];
		this.mapping = mapping || function () {};
		this.extras = extras || {};
	}
	
	
	var Parser = {};
	
	Parser.regex = {
			range: new RegExp('^\\[' + regexTemplates.number + '\\,' + regexTemplates.number + '\\]$'),
			set: new RegExp('^\\{(?:' + regexTemplates.number + ',)*' + regexTemplates.number + '\\}$'),
			id: new RegExp('^' + regexTemplates.id + '$|^$'), // includes empty string
			number: new RegExp('^' + regexTemplates.number + '$|^$'), // includes empty string
			variables: new RegExp(regexTemplates.id + regexTemplates.postVar, 'g'),
			functions: new RegExp(regexTemplates.id + regexTemplates.postFunc, 'g'),
			literals: new RegExp(regexTemplates.literal, 'g'),
			signature: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.id + ',)*' + regexTemplates.id + '\\)$'),
			call: new RegExp('^' + regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)$'),
			allCalls: new RegExp(regexTemplates.id + '\\((?:' + regexTemplates.literal + ',)*' + regexTemplates.literal + '\\)', 'g'), // call site this is called
			pds: new RegExp(regexTemplates.id + '\'' + regexTemplates.id, 'g'),
			//brackets: /[\[\]\{\}]/g,
			comparator: /(==|@=|<=|>=)/
		};
	
	Parser.uncaret = function(str) {
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
	
	Parser.extractVarIds = function(str) {
		return (str.match(Parser.regex.variables) || []).reduce(unique, []);
	};	
	
	Parser.formatFunction = function(str) {
		str = Parser.uncaret(str);
		str = str.replace(Parser.regex.functions, function(match) {
			return prefixes.hasOwnProperty(match)? prefixes[match]: match;
		});	
		return str;		
	};
	
	Parser.toExecutable = function(vars, str) {
		return new Function(vars, str)
	};
	
	Parser.parse = function(str) {
		var sides = str.split(Parser.regex.comparator),
			what = sides[0],
			using = Parser.extractVarIds(sides[2]),
			strFunction = Parser.formatFunction(sides[2]),
			realFunction = Parser.toExecutable(using, strFunction);
		return new Constraint(what, using, realFunction, {});
	};
	
	
	_G.ParserAlt = Parser;
}(this));(function(global){
    var grafar = global.grafar;
    var isExisty = grafar.isExisty;
    var setPop = grafar.setpop;
    var setPush = grafar.setpush;
    var union = grafar.union;
    var repeatArray = grafar.repeatArray;
    var stretchArray = grafar.repeatPoints;
    var blockRepeat = grafar.blockRepeat;
    
   
	var Reactive = function(data) {
        this.sources = [];
        this.targets = [];
        
		this.data = isExisty(data)? data: {};
		this.fn = function() {};
		this.isValid = false;
	};
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
    
    
    Reactive.prototype.push = function() {
        return this;
    };
    
    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    };
    
	Reactive.prototype.bind = function(newArgs) {        
        this.unbind();
        for (var i = 0; i < newArgs.length; i++)
            setPush(newArgs[i].targets, this);
        this.sources = newArgs.slice();
        return this;
    };
    
    Reactive.prototype.unbind = function() {
        for (var i = 0; i < this.sources.length; i++)
            setPop(this.sources[i].targets, this);      
        this.sources.length = 0;
        this.invalidate();
        return this;
    };
            	    	
	Reactive.prototype.validate = function() {
		if (!this.isValid) {
            var sourceData = [];
            for (var i = 0; i < this.sources.length; i++) {
                sourceData[i] = this.sources[i].value();
            }
            var res = this.fn(sourceData, this.data);
            if (isExisty(res))
                this.data = res;
			this.isValid = true;
		}
		return this;
	};
	
	Reactive.prototype.invalidate = function() {
		this.isValid = false;
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i].isValid)
                this.targets[i].invalidate();
		return this;
	};
    
    Reactive.prototype.value = function() {
        return this.validate().data;
    };
    
    
	grafar.Reactive = Reactive;
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar,
		pool = _G.pool,
        Panel = _G.Panel,
        config = _G.config,
		
		_T = global.THREE,
		Object3D = _T.Object3D,
		PointCloud = _T.PointCloud,
		Line = _T.Line,
		LinePieces = _T.LinePieces,
		BufferGeometry = _T.BufferGeometry,
		BufferAttribute = _T.BufferAttribute,
        
        PointCloudMaterial = _T.PointCloudMaterial,
        LineBasicMaterial = _T.LineBasicMaterial,
        MeshLambertMaterial = _T.MeshLambertMaterial,
        DoubleSide = _T.DoubleSide;
	
    
    function circleSprite(col) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            size = 5;
            
        canvas.width = 2 * size;
        canvas.height = 2 * size;
        
        context.beginPath();
        context.arc(size, size, size, 0, 2 * Math.PI, false);
        context.fillStyle = col || 'orange';
        context.fill();
      
        var mat = new THREE.PointCloudMaterial({
            size: size,
            transparent: true,
            sizeAttenuation: false,
            map: new THREE.Texture(canvas)
        });
        mat.map.needsUpdate = true;
        return mat;
    };
    
    function matHelper(type, col) {
        var mat = null;
        if (type === 'point')
            mat = new PointCloudMaterial({
                size: config.particleRadius, 
                transparent: true, 
                opacity: 0.5, 
                sizeAttenuation: false
            });
        else if (type === 'line')
            mat = new LineBasicMaterial({
            });            
        else if (type === 'mesh')
            mat = new THREE.MeshPhongMaterial({
                side: DoubleSide,
                transparent: true,
                opacity: .7
                //depthWrite: false
                //depthTest: false
            });
        mat.color = col;
        return mat;
    };
    
    function interleave(tab, buffer, itemsize) {
        itemsize = itemsize || tab.length;
        resizeBuffer(buffer, itemsize * tab[0].length);
        var target = buffer.array;
		for (var j = 0; j < tab.length; j++) {
            var colData = tab[j].array,
                len = tab[j].length;
            for (var i = 0, k = j; i < len; i++, k += itemsize)
                target[k] = colData[i];
		}
        for (var j = tab.length; j < itemsize; j++) {
            for (var i = 0, k = j; i < len; i++, k += itemsize)
                target[k] = 0;
		}
        buffer.needsUpdate = true;
    }
                
    function resizeBuffer(buffer, size) {
        var type = buffer.array.constructor;
        if (size !== buffer.array.length) {
            pool.push(buffer.array);
            buffer.array = pool.get(type, size);
            if (buffer.hasOwnProperty('length'))
                buffer.length = size;
        }
    };
    
    function InstanceGL(panel, col) {
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
		
		var object = new Object3D();
        object.add(new PointCloud(pointGeometry, matHelper('point', col)))
            .add(new Line(lineGeometry, matHelper('line', col), LinePieces))
            .add(new THREE.Mesh(meshGeometry, matHelper('mesh', col)));
		panel.scene.add(object);
        
        this.panel = panel;
        this.position = position;
        this.segments = lineIndex;
        this.faces = meshIndex;
        this.normals = normal;
        this.object = object;
    };
    
    
	_G.InstanceGL = InstanceGL;
	_G.interleave = interleave;
	_G.resizeBuffer = resizeBuffer;
    _G.circleSprite = circleSprite;
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var pool = _G.pool;
    var incArray = _G.incArray;
    var timesArray = _G.timesArray;
    var resizeBuffer = _G.resizeBuffer;
    var firstMatch = _G.firstMathch;
	
    
	function pathGraph(srcDummy, target) {
		var edgeCount = target.pointCount - 1;
        resizeBuffer(target, edgeCount * 2);
        var data = target.array;
		for (var i = 0, j = 0; i < edgeCount; i++, j += 2) {
			data[j] = i;
			data[j + 1] = i + 1;
		}
	}
    
	function emptyGraph(srcDummy, target) {
        resizeBuffer(target, 0);
	}
    
    
    function cartesianGraphProd2(src, target) {
        var arr1 = src[0].array,
            edgeCount1 = src[0].length / 2,
            nodeCount1 = src[0].pointCount,
            arr2 = src[1].array,
            edgeCount2 = src[1].length / 2,
            nodeCount2 = src[1].pointCount;
        
        // reactive of course these should be!
        resizeBuffer(target, (edgeCount1 * nodeCount2 + edgeCount2 * nodeCount1) * 2);
        target.pointCount = nodeCount1 * nodeCount2;
        
        var pos = 0;
        var buffer1 = new Uint32Array(arr1);
        for (var i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
            target.array.set(buffer1, pos);
            incArray(buffer1, nodeCount1);
        }
        
        var buffer2 = new Uint32Array(arr2);
        timesArray(nodeCount1, buffer2);
        for (var i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
            target.array.set(buffer2, pos);
            incArray(buffer2, 1);
        }
    };
    
    function cartesianGraphProdN(src, target) {
        var totalEdgeCount = 0;
        var totalNodeCount = 1;
        for (var i = 0; i < src.length; i++) {
            var accum = src[i].length / 2;
            for (var j = 0; j < src.length; j++)
                if (i !== j)
                    accum *= src[j].nodeCount;
            totalEdgeCount += accum;
            totalNodeCount *= src[i].nodeCount;
        }
        target.buffer(totalEdgeCount * 2);
        target.nodeCount = totalNodeCount;
        
        var edgeCounter = 0;
        var nodeCounter = 1;
        var targetArray = target.array;
        for (var i = 0; i < src.length; i++) {
            var factor = src[i].value(),
                factorEdgeCount = src[i].length / 2,
                factorNodeCount = src[i].nodeCount;
            
            var buffer1 = new Uint32Array(arr1);//
            for (var i = 0; i < nodeCount2; i++, pos += 2 * edgeCount1) {
                targetArray.set(buffer1, pos);
                incArray(buffer1, nodeCount1);
            }
            
            var buffer2 = new Uint32Array(arr2);
            timesArray(nodeCount1, buffer2);
            for (var i = 0; i < nodeCount1; i++, pos += 2 * edgeCount2) {
                targetArray.set(buffer2, pos);
                incArray(buffer2, 1);
            }
        }
    };
    
    function cartesianGraphProd(src, target) {
        // this is a disgusting, leaky implementation
        var accum = {
            array: new Uint32Array(0),
            pointCount: 1,
            length: 0
        };
        for (var i = 0; i < src.length; i++)
            cartesianGraphProd2([accum, src[i]], accum);
        resizeBuffer(target, accum.length);
        target.array.set(accum.array);
        target.pointCount = accum.pointCount;
    };
    
    
    function makeFaces2(src, target) {
        var arr1 = src[0].array,
            edgeCount1 = src[0].length / 2,
            nodeCount1 = src[0].pointCount,
            arr2 = src[1].array,
            edgeCount2 = src[1].length / 2,
            nodeCount2 = src[1].pointCount;
        
        // reactive of course these should be!
        resizeBuffer(target, edgeCount1 * edgeCount2 * 2 * 3);
        var targArray = target.array;
        target.pointCount = nodeCount1 * nodeCount2;
        
        var pos = 0;
        var buffer1 = new Uint32Array(arr1);
        for (var i = 0; i < edgeCount1; i++) {
            for (var j = 0; j < edgeCount2; j++) {
                var e1from = arr1[2 * i];
                var e1to = arr1[2 * i + 1];
                var e2from = arr2[2 * j];
                var e2to = arr2[2 * j + 1];
                
				targArray[pos] = e1from + e2from  * nodeCount1;
				targArray[pos + 1] = e1from + e2to  * nodeCount1;
				targArray[pos + 2] = e1to + e2to  * nodeCount1;
				pos += 3;
				
				targArray[pos] = e1from + e2from  * nodeCount1;
				targArray[pos + 1] = e1to + e2to  * nodeCount1;
				targArray[pos + 2] = e1to + e2from  * nodeCount1;
				pos += 3;
            }
        }
    }
    
    function makeFaces(src, target) {
        // leads to wild results for non-2D objects
        var nonEmpty = src.filter(function(src) { return src.length !== 0; });
        if (nonEmpty.length !== 2) {
            resizeBuffer(target, 0);
            return;
        }
        var leftStretch = src.slice(0, src.indexOf(nonEmpty[0]))
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
        var midStretch = src.slice(src.indexOf(nonEmpty[0]) + 1, src.indexOf(nonEmpty[1]))
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
        var rightStretch = src.slice(src.indexOf(nonEmpty[1]) + 1)
            .reduce(function(pv, cv) {
                return pv * cv.pointCount;
            }, 1);
            
        var accum = {
            array: new Uint32Array(0),
            pointCount: leftStretch,
            length: 0
        };
        
        var edgeCount1 = nonEmpty[0].length / 2;
        var nodeCount1 = nonEmpty[0].pointCount;
        var buffer = new Uint32Array(nonEmpty[0].array);
        
        resizeBuffer(accum, edgeCount1 * leftStretch * 2);
        accum.pointCount = leftStretch * nodeCount1;
        
        timesArray(leftStretch, buffer);
        for (var i = 0, pos = 0; i < leftStretch; i++, pos += 2 * edgeCount1) {
            accum.array.set(buffer, pos);
            incArray(buffer, 1);
        }
        
        edgeCount1 = accum.length / 2;
        nodeCount1 = accum.pointCount;
        buffer = new Uint32Array(accum.array);
        
        resizeBuffer(accum, edgeCount1 * midStretch * 2);
        accum.pointCount = midStretch * nodeCount1;
        
        for (var i = 0, pos = 0; i < midStretch; i++, pos += 2 * edgeCount1) {
            accum.array.set(buffer, pos);
            incArray(buffer, nodeCount1);
        }
        
        makeFaces2([accum, nonEmpty[1]], accum);
        
        if (rightStretch !== 1) {
            var rightPad = {
                array: new Uint32Array(0),
                pointCount: rightStretch,
                length: 0
            };
            cartesianGraphProd([accum, rightPad], accum)
        }
        
        resizeBuffer(target, accum.length);
        target.array.set(accum.array);
        target.pointCount = accum.pointCount;
    };
    
    
    _G.emptyGraph = emptyGraph;
    _G.pathGraph = pathGraph;
    _G.cartesianGraphProd = cartesianGraphProd;
    _G.makeFaces = makeFaces;
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
    var emptyGraph = _G.emptyGraph;
    var pathGraph = _G.pathGraph;
    var cartesianGraphProd = _G.cartesianGraphProd;
    var makeFaces = _G.makeFaces;
    var Buffer = _G.Buffer;
    var resizeBuffer = _G.resizeBuffer;
    var nunion = _G.nunion;
    var blockRepeat = _G.blockRepeat;
	
    
	function Graph() {
        this.data = new Reactive(new Buffer());
        this.edges = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.faces = new Reactive({
            array: new Uint32Array(0),
            length: 0
        });
        this.base = new Reactive({parent: this, struct: []});
	};
    
    
    var baseOrder = [],
        baseComparator = function(a, b) {
            return baseOrder.indexOf(a) >= baseOrder.indexOf(b);
        };
    
    Graph.contextify = function(col, targetBase) {
        var temp = new Graph();
        temp.base = targetBase;
        temp.data.lift(function(par, out) {
            var data = par[0],
                colBase = par[1].struct,
                targetBase = par[2].struct,
                totalLength = targetBase.reduce(function(pv, cv) {
                    return pv * cv.data.value().length;
                }, 1),
                blockSize = 1,
                len = data.length;
            resizeBuffer(out, totalLength);
            var res = out.array;
            res.set(data.array);
            for (var i = 0; i < targetBase.length; i++) {
                if (colBase.indexOf(targetBase[i]) === -1) {
                    blockRepeat(
                        res, 
                        blockSize, 
                        Math.floor(len / blockSize),
                        targetBase[i].data.value().length,
                        res
                    );
                    len *= targetBase[i].data.value().length;
                }
                blockSize *= targetBase[i].data.value().length;
            }
        }).bind([col.data, col.base, temp.base]);
        return temp;
    };
    
    Graph.unify = function(cols) {
        var targetBase = new Reactive({
                parent: null,
                struct: []
            })
            .lift(Graph.baseTranslate)
            .bind(cols.map(function(col) {
                return col.base;
            }));
        var baseEdges = new Reactive([])
            .lift(function(src, targ) {
                return src[0].struct.map(function(base) {
                    return base.edges.value();
                });
            })
            .bind([targetBase]);
        var targetEdges = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift(function(arr, targ) {
                cartesianGraphProd(arr[0], targ);
            })
            .bind([baseEdges]);
        var targetFaces = new Reactive({
                array: new Uint32Array(0),
                length: 0
            })
            .lift(function(arr, targ) {
                makeFaces(arr[0], targ);
            })
            .bind([baseEdges]);
        return cols.map(function(col) {
            var unified = Graph.contextify(col, targetBase);
            unified.edges = targetEdges;
            unified.faces = targetFaces;
            return unified;
        });
    };
    
    Graph.baseTranslate = function(src, self) {
        if (src.length === 0) {
            baseOrder.push(self.parent);
            self.struct = [self.parent];
        } else {
            nunion(src.map(function(b) {
                return b.struct;
            }), self.struct);
            self.struct.sort(baseComparator);
        }
    };
    
    
	_G.GraphR = Graph;
}(this));'use strict';
	
(function(global) {
	var _G = global.grafar,
		Style = _G.Style,
		pool = _G.pool,
        isExisty = _G.isExisty,
        asArray = _G.asArray,
        nunion = _G.nunion,
        baseTranslate = _G.baseTranslate,
        pathGraph = _G.pathGraph,
        emptyGraph = _G.emptyGraph,
        cartesianGraphProd = _G.cartesianGraphProd,
        
        Graph = _G.GraphR,
        Reactive = _G.Reactive,
        Buffer = _G.Buffer,
        
        InstanceGL = _G.InstanceGL,
        interleave = _G.interleave,
        resizeBuffer = _G.resizeBuffer;
	
    
    function Object(opts) {
		this.datasets = {};
        this.projections = {};
        
		this.glinstances = [];
        //this.graphs = [];
		this.hidden = false;
        this.col = Style.randColor();
	}
		
	Object.prototype.pin = function(panel) {
        var instance = new InstanceGL(panel, this.col);
		this.glinstances.push(instance);
        // var graph = new Reactive().lift(function(proj){
            // interleave(proj, instance.position);
        // }).bind(this.project()) // won't work because of undefined unification
        //this.graphs.push(graph);
		return this;
	
	};
    
	Object.prototype.constrain = function(constraint, fn, opts) {
        if (typeof constraint === 'string') {
            opts = opts || {};
            var split = constraint.split(':'),
                names = asArray(split[0] || []),
                using = asArray(split[1] || []),
                as = fn || function() {},
                maxlen = opts.maxlen || 40,
                discrete = opts.discrete || false;
        } else {
            var names = asArray(constraint.what || []),
                using = asArray(constraint.using || []),
                as = constraint.as || function() {},
                maxlen = constraint.maxlen || 40,
                discrete = constraint.discrete || false;
        }
            
        var sources = this.project(using, true);
        // I only do this shit because project forces product
        // however, if it doesn't (force), memo would have to go into unify
        // which sucks even worse
        for (var i = 0; i < names.length; i++)
            if (!this.datasets.hasOwnProperty(names[i]))
                this.datasets[names[i]] = new Graph();
        
        var computation = new Graph();
        computation.data = new Reactive({
                buffers: names.map(function() { return new Buffer(); }), 
                length: 0
            })
            .lift(function(par, out) {
                var data = {};
                for (var i = 0; i < using.length; i++)
                    data[using[i]] = par[i].array;
                out.length = par.length === 0? maxlen: par[0].length;
                for (var i = 0; i < names.length; i++) {
                    resizeBuffer(out.buffers[i], out.length);
                    data[names[i]] = out.buffers[i].array;
                }
                as(data, out.length, {});
            })
            .bind(sources.map(function(src) {
                return src.data;
            }));
        if (sources.length === 0) {
            computation.edges.data.pointCount = maxlen;
            computation.edges.lift(discrete? emptyGraph: pathGraph);
        } else {
            computation.edges
                .lift(function(src, targ) {
                    // is clone stupid?
                    targ.pointCount = src[0].pointCount;
                    resizeBuffer(targ, src[0].length);
                    targ.array.set(src[0].array);
                })
                .bind(sources.map(function(src) {
                    return src.edges;
                }));
        }
        computation.base
            .lift(Graph.baseTranslate)
            .bind(sources.map(function(src) {
                return src.base;
            }));
            
        for (var i = 0; i < names.length; i++) {
            var dataset = this.datasets[names[i]];
            
            dataset.base = computation.base;
            dataset.edges = computation.edges;
            
            (function(iLoc) {
                dataset.data
                    .lift(function(src, target) {
                        target.length = src[0].buffers[iLoc].length;
                        target.array = src[0].buffers[iLoc].array;
                    })
                    .bind([computation.data]);
            }(i));                
        }

		return this;
	};
	
    Object.prototype.project = function(names, proxy) {
        var names = asArray(names || []);
        var namesHash = names.slice().sort().toString();
        if (!this.projections.hasOwnProperty(namesHash)) {
            var temp = [];
            for (var i = 0; i < names.length; i++) {
                if (!this.datasets.hasOwnProperty(names[i])) {
                    if (proxy)
                        this.datasets[names[i]] = new Graph();
                    else
                        throw new Error('cannot select undefined');
                }
                temp[i] = this.datasets[names[i]];
            }
            this.projections[namesHash] = Graph.unify(temp);
        }
		return this.projections[namesHash];
	};
    
	Object.prototype.refresh = function() {
		for (var i = 0; i < this.glinstances.length; i++) {
			var instance = this.glinstances[i];
			var tab = this.project(instance.panel._axes, false);
            if (tab.every(function(col) { return col.data.isValid; })) {
                return this;
            }
            
			interleave(tab.map(function(c) {return c.data.value()}), instance.position, 3);
			interleave([tab[0].edges.value()], instance.segments);
            interleave([tab[0].faces.value()], instance.faces);
            
            resizeBuffer(instance.normals, tab[0].data.value().length * 3);
            instance.object.children[2].geometry.computeVertexNormals();
            instance.normals.needsUpdate = true;
            
            var hasEdges = tab[0].edges.value().length > 0;
            var hasFaces = tab[0].faces.value().length > 0;
			//instance.object.children[0].visible = true; // !(hasEdges || hasFaces);
			//instance.object.children[1].visible = true;
			//instance.object.children[2].visible = true;
		}
		return this;
	};
    
    Object.prototype.run = function() {
        this.refresh();
        window.requestAnimationFrame(this.run.bind(this));
        return this;
    };
    
	Object.prototype.hide = function(hide) {
		for (var i = 0; i < this.glinstances.length; i++)
			this.glinstances[i].object.visible = !hide;
		return this;
	};
        
    Object.prototype.reset = function() {return this;};
        
        
	_G.Object = Object;
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

        
	function MathSystem(str, targetRef) {
		var nodes = MathSystem.strToAtomicNodes(str);
		nodes = MathSystem.collapseNodes(nodes);
		this.plan = new Plan(nodes, targetRef);
	}

	MathSystem.formatFunction = function(str) {
		str = MathSystem.uncaret(str);
		str = str.replace(parserRegex.functions, function(match) {
			return prefixes.hasOwnProperty(match)? prefixes[match]: match;
		});	
		return str;		
	};
    
	MathSystem.extractVariables = function(str) {
		return (str.match(parserRegex.variables) || []).reduce(unique, []);
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
				constraints[i] = sides[2] + '- (' + sides[0] + ')';
			else if (sides[1] === '<=')
				constraints[i] = sides[0] + '- (' + sides[2] + ')';
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
		opts = opts || {};		
		panels.push(this);
		
		container = container || config.container;
		var containerStyle = window.getComputedStyle(container),
			bgcolor = containerStyle.backgroundColor,
		    width = parseInt(containerStyle.width),
		    height = parseInt(containerStyle.height);

		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
		this.camera.position.set(-4, 4, 5);
		
		this.scene = new THREE.Scene();
		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.set( 0, 5, 7 );
		this.scene.add( pointLight );
		pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.set( 0, -5, -7 );
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
	};
	
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
			var axisGeometry = new THREE.BufferGeometry();
			axisGeometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 18), 3));
			this.axisObject = new THREE.Line(
				axisGeometry, 
				new THREE.LineBasicMaterial({color: 0x888888}), 
				THREE.LinePieces
			);			
			this.scene.add(this.axisObject);
		}
		setAxisGeometry(this.axisObject.geometry.getAttribute('position').array, len, this._axes.length);
		
        if (!isExisty(this.axisLabels)) {
			this.axisLabels = new THREE.Object3D();
			for (var i = 0; i < 3; i++) {
				var labelPos = new THREE.BufferGeometry();
				labelPos.addAttribute('position', new THREE.BufferAttribute(this.axisObject.geometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
				this.axisLabels.add(new THREE.PointCloud(labelPos, new THREE.PointCloudMaterial()));
			}
            this.scene.add(this.axisLabels);
        }
        this.axisLabels.children.forEach(function(child, i) {
			drawTextLabel(child.material, this._axes[i] || '');
		}.bind(this));
		
		return this;
	};
		
	Panel.prototype.setAxes = function(axisNames) {		
		this._axes = [axisNames[1], axisNames[2], axisNames[0]].filter(isExisty);
		if (axisNames.length === 3) {
			this.controls.noRotate = false;
			this.camera.up.set(0, 1, 0);
		} else if (axisNames.length === 2) {
			this.controls.noRotate = true;
			this.camera.position.set(0, 0, -5);
			this.camera.up.set(1, 0, 0);
		} else {
            throw new Error('wrong amount of axes specified');
		}			
		this.drawAxes(2);
		
		return this;
	};
		
	
	function setAxisGeometry(posArray, length, dim) {
        dim = dim || 3;
		for (var i = 0; i < 3; i++) {
            var len = i < dim? length: 0;
			posArray[7 * i] = -len;
			posArray[7 * i + 3] = len;
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