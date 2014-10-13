'use strict';

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
}(this));