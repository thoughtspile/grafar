(function(global){
	var grafar = global.grafar;


    var wrapFn = function(fn) {
        var nargfn = nListMap(fn.length);
        var boundfn = function(src, target) {
            nargfn(fn, src, target);
        };
        return boundfn;
    };

    var nListMap = function(nargs) {
		nListMap.cache = nListMap.cache || [];
		if (nListMap.cache[nargs])
			return nListMap.cache[nargs];

        var application = '';
        for (var i = 0; i < nargs; i++) {
            application += 'src[' + i + '].array[i]';
            if (i !== nargs - 1)
                application += ', ';
        }
        nListMap.cache[nargs] = new Function('fn', 'src', 'target',
            'var len = (src[0] || target).length;\n' +
            'for (var i = 0; i < len; i++)\n' +
            '  target.array[i] = fn(' + application + ');');
		return nListMap.cache[nargs];
    };


    grafar.wrapFn = wrapFn;
    grafar.nListMap = nListMap;
}(this));
