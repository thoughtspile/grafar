function dot(a, b) {
	var temp = 0,
		l = a.length;
	for (var i = 0; i < l; i++)
		temp += a[i] * b[i];
	return temp;
}

function norm(a) {
	var aNorm = 0,
		l = a.length;
	for (var i = 0; i < l; i++)
		aNorm += Math.abs(a[i]);
	return aNorm;
}

function dist(a, b) {
	var abDist = 0,
		l = a.length;
	for (var i = 0; i < l; i++)
		abDist += Math.abs(a[i] - b[i]);
	return abDist;
}


module.exports = {
	dot: dot,
	norm: norm,
	dist: dist
};
