'use strict';

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
}(this));