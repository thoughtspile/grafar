'use strict';

(function(global) {
	var _G = global.grafar,
		makeID = _G.makeID,
		isExisty = _G.isExisty;
	
	var objectList = {}, 
		typedList = {};	
	
	function Observable() {
		var id = makeID(objectList);
		objectList[id] = this;
		this.id = id;
		
		this.handlers = {};
	}
	
	Observable.prototype.on = function(event, handler) {
		if (!isExisty(this.handlers[event]))
			this.handlers[event] = {};
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
		if (isExisty(this.handlers[event]))
			this.handlers[event].forEach(function(handler) {
				handler();
			});
		return this;
	};
	
	
	// export
	
	_G.observer = observer;
	_G.objectList = objectList;
	_G.Observable = Observable;
}(this));