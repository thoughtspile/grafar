function union(a, b, out) {
    out = out || [];
    if (out !== a && out !== b)
        out.length = 0;
    a.reduce(setpush, out);
    b.reduce(setpush, out);
	return out;
}

function nunion(sets, out) {
    out = out || [];
    if (sets.indexOf(out) === -1)
        out.length = 0;
    sets.forEach(function(set) {
        union(out, set, out);
    });
	return out;
};

function setpush(arr, el) {
	if (arr.indexOf(el) === -1)
		arr.push(el);
	return arr;
}

function setpop(arr, el) {
	var i = arr.indexOf(el);
	if (el !== -1)
		arr.splice(i, 1);
	return arr;
}

export {
	union,
	nunion,
	setpush,
	setpop
}
