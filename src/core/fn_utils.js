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
        var application = '';
        for (var i = 0; i < nargs; i++) {
            application += 'src[' + i + '].array[i]';
            if (i !== nargs - 1)
                application += ', ';
        }
        
        return new Function('fn', 'src', 'target',
            'var len = src[0].length;\n' +
            'grafar.resizeBuffer(target, len);\n' + // !!!!
            'for (var i = 0; i < len; i++)\n' + 
            '  target.array[i] = fn(' + application + ');');
    };
    
    
    grafar.wrapFn = wrapFn;
    grafar.nListMap = nListMap;
}(this));