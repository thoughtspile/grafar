function isExisty(obj) {
	return typeof(obj) !== 'undefined' && obj !== null;
}

function animate(fn) {
	var wrapped = function() {
		var proceed = fn();
		if (proceed)
			window.requestAnimationFrame(wrapped);
	};
	wrapped();
	return grafar;
};

function deepFilter(obj, predicate, ignore) {
	ignore = ignore || function() { return false; };
	var matches = [];
	deepForEach(obj, function(el) {
		if (predicate(el))
			matches.push(el);
	}, ignore);
	return matches;
}

function deepForEach(obj, action, ignore, deepKey) {
	deepKey = deepKey || '';
	if (isExisty(obj)) Object.keys(obj).forEach(function(key) {
		var nextKey = deepKey + (deepKey? '.': '') + key;
		action(obj[key], nextKey);
		if (!ignore(obj[key]))
			deepForEach(obj[key], action, ignore, nextKey);
	});
};

function deepKeyAssign(obj, key, val) {
	var key = key.split('.');
	for (var i = 0; i < key.length - 1; i++) {
		obj = obj[key[i]];
	}
	obj[key[key.length - 1]] = val;
	return obj;
};


module.exports = {
	isExisty: isExisty,
	animate: animate,
	deepFilter: deepFilter,
	deepForEach: deepForEach,
	deepKeyAssign: deepKeyAssign
};
