import { isExisty, makeID } from './utils';

var objects = {};

export class Observable{
	constructor() {
		var id = makeID(objects);
		objects[id] = true;
		this.id = id;

		this.handlers = {};
	}

	on(event, handler) {
		if (!isExisty(this.handlers[event]))
			this.handlers[event] = [];
		this.handlers[event].push(handler);
		return this;
	}

	off(event, handler) {
		var handlers = this.handlers[event];
		if (isExisty(handlers)) {
			var index = handlers.indexOf(handler);
			if (index !== -1)
				handlers.splice(index, 1);
		}
		return this;
	}

	dispatch(event) {
		if (isExisty(this.handlers[event])) {
			var queue = this.handlers[event];
			for (var i = 0; i < queue.length; i++)
				queue[i]();
		}
		return this;
	}
}
