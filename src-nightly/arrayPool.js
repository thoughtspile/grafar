import { isExisty } from './utils';

export const pool = {
	pool: {},

	get(Constructor, length) {
		const classKey = Constructor.toString();
		const constructorKey = length.toString();
		const classPool = this.pool[classKey];

		if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0) {
			return classPool[constructorKey].pop();
		}
		return new Constructor(length);
	},

	push(obj) {
		const classKey = obj.constructor.toString();
		const constructorKey = obj.length.toString();

		if (!isExisty(this.pool[classKey])) {
			this.pool[classKey] = {};
		}

		if (!isExisty(this.pool[classKey][constructorKey])) {
			this.pool[classKey][constructorKey] = [];
		}

		this.pool[classKey][constructorKey].push(obj);
	},

	flush() {
		this.pool = {};
	}
}
