(function(global){
	var grafar = global.grafar;
    
    
    var wrapFn = function(fn) {
        var nargfn = nListMap(fn.length);
        var boundfn = function(src, target, len) {
            nargfn(fn, src, target, len);
        };
        return boundfn;
    };
        
    var uniformFn = function(val) {
        return function(src, target, len) {
            for (var i = 0; i < len; i++)
                target[i] = val;
        };
    };
        
    var nListMap = function(nargs) {
        var application = '';
        var getvals = '';//var srcdata = [';
        for (var i = 0; i < nargs; i++) {
            //application += 'srcdata[' + i + '][i]';
            application += 'srcdata_' + i + '[i]';
            //getvals += 'src[' + i + '].value()';
            getvals += 'var srcdata_' + i + ' = src[' + i + '].value();';
            if (i !== nargs - 1) {
                application += ', ';
                //getvals += ', ';
            }
        }
        //getvals += '];\n';
        console.log(getvals + 
            'for (var i = 0; i < len; i++)\n' + 
            '  target[i] = fn(' + application + ');');
        return new Function('fn', 'src', 'target', 'len', 
            getvals + 
            'for (var i = 0; i < len; i++)\n' + 
            '  target[i] = fn(' + application + ');');
    };
    
    
    grafar.wrapFn = wrapFn;
    grafar.uniformFn = uniformFn;
    grafar.nListMap = nListMap;
}(this));