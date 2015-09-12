(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from reactive.js
	var Reactive = grafar.Reactive;
    // array_utils.js
    var Buffer = grafar.Buffer;
    // glutils.js
    var resizeBuffer = grafar.resizeBuffer;
    // fn_utils
    var wrapFn = grafar.wrapFn;
    var nunion = grafar.nunion;
    
    
    var counter = 0;
    
    var rnum = function(value) {
        return new Reactive(Number(value));
    };
    
    var rseq = function(a, b, n) {
        if (!Reactive.isReactive(a))
            a = rnum(a);
        if (!Reactive.isReactive(b))
            b = rnum(b);
        if (!Reactive.isReactive(n))
            n = rnum(n);
             
        var seq = new Reactive(new Buffer())
            .lift(function(param, buff) {
                var a = param[0];
                var b = param[1];
                var n = param[2];
                var step = (b - a) / (n - 1);
                
                resizeBuffer(buff, n);
                var arr = buff.array;
                for (var i = 0; i < n; i++)
                    arr[i] = a + i * step;
            })
            .bind([a, b, n]);
        seq.data.base = new Reactive([counter++]);
        return seq;
    };
        
    var rprod = function(factors) {        
        var targetBase = new Reactive([])
            .lift(function(src, targ) {
                nunion(src, targ);
                targ.sort(function(a, b) { return a < b; });
            })
            .bind(factors.map(function(p) {
                return p.data.base || new Reactive([]);
            }));
            
        var prod = factors.map(function(col) {
            if (!col.data.hasOwnProperty('array'))
                col = new Reactive(new Buffer())
                    .lift(function(src, buff) {
                        resizeBuffer(buff, 1);
                        buff[0] = src[0];
                    })
                    .bind([col]);
            var unified = new Reactive(col.data);
            unified.base = targetBase;
            return unified;
        });
        
        return prod;
    };
        
    var rmap = function(params, fn) {
        var seq = new Reactive(new Buffer())
            .lift(wrapFn(fn))
            .bind(params);
        seq.data.base = params[0].base;
        return seq;
    };
    
    
    grafar.rseq = rseq;
    grafar.rprod = rprod;
    grafar.rnum = rnum;
    grafar.rmap = rmap;
}(this));