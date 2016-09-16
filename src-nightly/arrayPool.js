import { isExisty } from './utils';

export const pool = {
	pool: {},

	get(Constructor, length) {
		var classKey = Constructor.toString(),
			constructorKey = length.toString(),
			classPool = this.pool[classKey],
			temp = null;
		if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0)
			temp = classPool[constructorKey].pop();
		else
			temp = new Constructor(length);
		return temp;
	},

	push(obj) {
		var classKey = obj.constructor.toString(),
			constructorKey = obj.length.toString();

		if (!isExisty(this.pool[classKey]))
			this.pool[classKey] = {};
		if (!isExisty(this.pool[classKey][constructorKey]))
			this.pool[classKey][constructorKey] = [];

		this.pool[classKey][constructorKey].push(obj);
	},

	flush() {
		this.pool = {};
	}
}
