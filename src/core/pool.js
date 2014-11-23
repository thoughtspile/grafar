(function(global) {
	var _G = global.grafar,
		isExisty = _G.isExisty,
		stats = _G.stats;
	
	stats.add('alloc').add('free');
	
	var arrayPool = {};
	
	arrayPool.pool = {};
		
	arrayPool.get = function(Constructor, length) {
		stats.enter('alloc');
		var classKey = Constructor.toString(),
			constructorKey = length.toString(),
			classPool = this.pool[classKey],
			temp = null;
		if (isExisty(classPool) && isExisty(classPool[constructorKey]) && classPool[constructorKey].length !== 0)
			temp = classPool[constructorKey].pop();
		else
			temp = new Constructor(length);
		stats.exit('alloc');
		return temp;
	};
		
	arrayPool.push = function(obj) {
		stats.enter('free');
		var classKey = obj.constructor.toString(),
			constructorKey = obj.length.toString();
			
		if (!isExisty(this.pool[classKey]))
			this.pool[classKey] = {};
		if (!isExisty(this.pool[classKey][constructorKey]))
			this.pool[classKey][constructorKey] = [];
			
		this.pool[classKey][constructorKey].push(obj);
		stats.exit('free');
	};
		
	arrayPool.flush = function() {
		this.pool = {};
	};
	
	
	// export
	
	_G.pool = arrayPool;
}(this));