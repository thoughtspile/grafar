import { isExisty, makeID } from './utils';

const objects = {};

export class Observable{
	constructor() {
		const id = makeID(objects);
		objects[id] = true;
		this.id = id;

		this.handlers = {};
	}

	on(event, handler) {
		if (!isExisty(this.handlers[event])) {
			this.handlers[event] = [];
		}
		this.handlers[event].push(handler);
		return this;
	}

	off(event, handler) {
		const handlers = this.handlers[event];
		if (isExisty(handlers)) {
			const index = handlers.indexOf(handler);
			if (index !== -1) {
				handlers.splice(index, 1);
			}
		}
		return this;
	}

	dispatch(event) {
		(this.handlers[event] || []).forEach(handle => handle());
		return this;
	}
}
