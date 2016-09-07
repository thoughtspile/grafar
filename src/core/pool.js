import { grafar } from '../grafar';
import { isExisty } from './misc';

// static array pool
var arrayPool = {
	pool: {},

	get: function(Constructor, length) {
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

	push: function(obj) {
		var classKey = obj.constructor.toString(),
			constructorKey = obj.length.toString();

		if (!isExisty(this.pool[classKey]))
			this.pool[classKey] = {};
		if (!isExisty(this.pool[classKey][constructorKey]))
			this.pool[classKey][constructorKey] = [];

		this.pool[classKey][constructorKey].push(obj);
	},

	flush: function() {
		this.pool = {};
	}
};

export { pool }
