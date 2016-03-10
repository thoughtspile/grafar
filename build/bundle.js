(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.grafar = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var _G = (module.exports = function(value) {
        return new global.grafar.Reactive(function() { return value; });
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

_G.version = '0.4.4';
_G.config = config;
_G.panels = panels;
_G.update = update;
_G.setup = setup;
_G.frameId = 0;

update();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
var isExisty = require('./misc.js').isExisty;
var wrapFn = require('./fn_utils.js').wrapFn;
var blockRepeat = require('../math/array_utils.js').blockRepeat;
var union = require('../math/set.js').union;
var pool = require('./pool');


function Buffer(type, length) {
    if (typeof type === 'number' && !isExisty(length)) {
        length = type;
        type = Float32Array;
    }
    this.array = pool.get(type || Float32Array, length || 0);
    this.length = this.array.length;
}

function makeBuffer(type, length) {
    return new Buffer(type, length);
};


Buffer.map = function(params, fn, target) {
    wrapFn(fn)(params, target);
    return target;
};

Buffer.mapify = function(fn) {
    var buffMap = wrapFn(fn);
    return function(params, target) {
        buffMap(params, target);
        return target;
    };
};


Buffer.prototype.reserve = function(length) {
    this.array = pool.swap(this.array, length);
    return this;
};

Buffer.prototype.resize = function (length) {
    if (this.array.length < length)
        this.array = pool.swap(this.array, length);
    this.length = length;
    return this;
};


module.exports = {
    Buffer2: Buffer,
    buffer: makeBuffer,
    map: Buffer.map,
    mapify: Buffer.mapify
};

},{"../math/array_utils.js":8,"../math/set.js":9,"./fn_utils.js":3,"./misc.js":4,"./pool":6}],3:[function(require,module,exports){
var wrapFn = function(fn) {
    var nargfn = nListMap(fn.length);
    var boundfn = function(src, target) {
        nargfn(fn, src, target);
    };
    return boundfn;
};

var nListMap = function(nargs) {
	nListMap.cache = nListMap.cache || [];
	if (nListMap.cache[nargs])
		return nListMap.cache[nargs];

    var application = '';
    for (var i = 0; i < nargs; i++) {
        application += 'src[' + i + '].array[i]';
        if (i !== nargs - 1)
            application += ', ';
    }
    nListMap.cache[nargs] = new Function('fn', 'src', 'target',
        'var len = (src[0] || target).length;\n' +
        'for (var i = 0; i < len; i++)\n' +
        '  target.array[i] = fn(' + application + ');');
	return nListMap.cache[nargs];
};


module.exports = {
	wrapFn: wrapFn,
	nListMap: nListMap
};

},{}],4:[function(require,module,exports){
function isExisty(obj) {
	return typeof(obj) !== 'undefined' && obj !== null;
}

function animate(fn) {
	var wrapped = function() {
		var proceed = fn();
		if (proceed)
			window.requestAnimationFrame(wrapped);
	};
	wrapped();
	return grafar;
};

function deepFilter(obj, predicate, ignore) {
	ignore = ignore || function() { return false; };
	var matches = [];
	deepForEach(obj, function(el) {
		if (predicate(el))
			matches.push(el);
	}, ignore);
	return matches;
}

function deepForEach(obj, action, ignore, deepKey) {
	deepKey = deepKey || '';
	if (isExisty(obj)) Object.keys(obj).forEach(function(key) {
		var nextKey = deepKey + (deepKey? '.': '') + key;
		action(obj[key], nextKey);
		if (!ignore(obj[key]))
			deepForEach(obj[key], action, ignore, nextKey);
	});
};

function deepKeyAssign(obj, key, val) {
	var key = key.split('.');
	for (var i = 0; i < key.length - 1; i++) {
		obj = obj[key[i]];
	}
	obj[key[key.length - 1]] = val;
	return obj;
};


module.exports = {
	isExisty: isExisty,
	animate: animate,
	deepFilter: deepFilter,
	deepForEach: deepForEach,
	deepKeyAssign: deepKeyAssign
};

},{}],5:[function(require,module,exports){

var config = require('../config.js');
var isExisty = require('./misc.js').isExisty;

var THREE = (window.THREE);
var Detector = (window.Detector);
var Stats = (window.Stats);

var panels = config.panels;
var Renderer = (function() {
	if (Detector.webgl)
		return THREE.WebGLRenderer.bind(null, {antialias: config.antialias});
	if (Detector.canvas)
		return THREE.CanvasRenderer;
	return Error.bind(null, 'no 3D support')
}());


function Panel(container) {
	container = container || config.container;
	var containerStyle = window.getComputedStyle(container);
	var bgcolor = containerStyle.backgroundColor;
	var width = parseInt(containerStyle.width);
	var height = parseInt(containerStyle.height);

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

	this.dim(3);

	if (config.debug) {
		this.stats = new Stats();
		this.stats.domElement.style.position = 'fixed';
		container.appendChild(this.stats.domElement);
	} else {
		this.stats = {update: function() {}};
	}

	container.appendChild(this.renderer.domElement);
	panels.push(this);
};

function panelFactory(container, opts) {
	if (typeof container === 'string')
		container = document.getElementById(container);
	return new Panel(container, opts);
}


Panel.prototype.update = function() {
	this.controls.update();
	this.renderer.render(this.scene, this.camera);
	this.stats.update();
};

Panel.prototype.dim = function(nDim) {
	if (nDim === 3) {
		this.controls.noRotate = false;
		this.camera.up.set(0, 1, 0);
	} else if (nDim === 2) {
		// pan with LMB
		this.controls.noRotate = true;
		this.camera.position.set(0, 0, -5);
		this.camera.up.set(1, 0, 0);
	} else {
        throw new Error('wrong amount of axes specified');
	}

	return this;
};


module.exports = {
	Panel: Panel,
	panel: panelFactory
};

},{"../config.js":1,"./misc.js":4}],6:[function(require,module,exports){
var arrayPool = {
	arrays: [],

	get: function(Constructor, length) {
		for (var i = 0; i < this.arrays.length; i++) {
			var cand = this.arrays[i];
			if (cand.constructor === Constructor && cand.length === length)
				return this.arrays.splice(i, 1)[0];
		}
		return new Constructor(length);
	},

	push: function(obj) {
		this.arrays.push(obj);
	},

	swap: function(arr, length) {
		var type = arr.constructor;
		this.push(arr);
		return this.get(type, length);
	},

	flush: function() {
		this.pool.length = 0;
	}
};

module.exports = arrayPool;

},{}],7:[function(require,module,exports){
module.exports = {
	config: require('./config.js'),

	panel: require('./core/panel.js'),
	buffer: require('./core/buffer.js'),
};

},{"./config.js":1,"./core/buffer.js":2,"./core/panel.js":5}],8:[function(require,module,exports){
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

function Buffer(toWrap) {
    toWrap = toWrap || new Float32Array(0);
    this.array = toWrap;
    this.length = toWrap.length;
}


module.exports = {
	Buffe: Buffer,
	incArray: incArray,
	timesArray: timesArray,
	repeatArray: repeatArray,
	blockRepeat: blockRepeat,
	repeatPoints: repeatPoints
};

},{}],9:[function(require,module,exports){
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


module.exports = {
	union: union,
	nunion: nunion,
	setpush: setpush,
	setpop: setpop
};

},{}]},{},[7])(7)
});