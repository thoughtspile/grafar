(function(global){
    var grafar = global.grafar;
	var Reactive = grafar.Reactive;
    var Buffer = grafar.Buffer;
    var resizeBuffer = grafar.resizeBuffer;
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
        return factors.map(function(col) {
            var unified = Graph.contextify(col, targetBase);
            return unified;
        });
    };
        
    var rmap = function(params, fn) {
        var seq = new Reactive(new Buffer())
            .lift(wrapFn(fn))
            .bind(params);
        seq.data.base = new Reactive([])
            .lift(nunion)
            .bind(params.map(function(p) {
                return p.data.base;
            }));
        return seq;
    };
    
    
    grafar.rseq = rseq;
    grafar.rprod = rprod;
    grafar.rnum = rnum;
    grafar.rmap = rmap;
}(this));