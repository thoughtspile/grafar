'use strict';

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
			
	function makeID(obj) {
		while (true) {
			var temp = Math.random().toString(36).substr(2, 9); 
			if (!(temp in obj))
				return temp;
		}
	};
					
	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
	
	function bind(di, context) {
		context.bindBuffer(di.buffers.vertex);
		context.bindBuffer(di.buffers.index);
		context.onUpdate.push(di.update);
	}
	
	
	function Timer(scale) {
		this.start = new Date().getTime();
		this.scale = scale || 1;
	}
	
	Timer.prototype.get = function() {
		return (new Date().getTime() - this.start) / this.scale;
	}
	
	Timer.prototype.reset = function() {
		Timer.call(this, this.scale);
		return this;
	}
		
		
	function DiscreteTimer(step) {
		this.counter = 0;
		this.step = step || 1;
	}
	
	DiscreteTimer.prototype.get = function() {
		var temp = this.counter;
		this.counter += this.step;
		return temp;
	}
	
	DiscreteTimer.prototype.reset = function() {	
		DiscreteTimer.call(this, this.scale);
	}
	
	
	function Process(timer, callback) {
		this.timer = timer;
		this.active = true;
		this.timed = function() {
			callback(this.timer.get());
			if (this.active)
				window.requestAnimationFrame(this.timed);
		}.bind(this);
		return this;
	}
	
	Process.prototype.start = function() {
		this.active = true;
		this.timer.reset();
		this.timed();
		return this;
	}
	
	Process.prototype.stop = function() {
		this.active = false;
		return this;
	}
	
		
	var config = {
		debug: true,
		
		moduleName: 'grafar',
		rootGraphId: '$',
				
		minPanelWidth: 600,
		minPanelHeight: 600,
		container: window,
		
		axes: ['x', 'y', 'z'],
		axisLength: 2,
		labelSize: .32,
		
		style: {
			overlay: false,
			color: 'royalblue',
			alpha: 0,
			fill: false,
			type: 'l',
			radius: .05,
			start: '',
			end: ''
		},
		
		antialias: true,
		
		precision: .0001,
		samples: 41,
		hide: false,
		
		chunkTime: 30,
		tweenTime: 900,
		
		tweenFunction: function(s, e, t) {
			var part = (1 - Math.cos(Math.PI * t / _G.config.tweenTime)) / 2;  // non-local reference
			return s * (1 - part) + e * part;
		}
	}
	
	// export
	
	_G.config = config;
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.Timer = Timer;
	_G.Process = Process;
	_G.bind = bind;
}(this));

function ST() {
	return new Date().getTime();
}