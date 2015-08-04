(function(global){
    var grafar = global.grafar;
	var Reactive = grafar.Reactive;
    var Buffer = grafar.Buffer;
    var resizeBuffer = grafar.resizeBuffer;
    
    
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
             
        return new Reactive(new Buffer())
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
    };
            
    var rmap = function(params, fn) {
        if (params.length > 1)
            throw new Error('fuckup');
            
        return new Reactive(new Buffer())
            .lift(function(param, buff) {
                var inputBuff = param[0];
                var n = inputBuff.length;
                resizeBuffer(buff, n);
                var arrFrom = inputBuff.array;
                var arrTo = buff.array;
                for (var i = 0; i < n; i++)
                    arrTo[i] = fn(arrFrom[i]);
            })
            .bind(params);
    };
    
    
    grafar.rseq = rseq;
    grafar.rnum = rnum;
    grafar.rmap = rmap;
}(this));