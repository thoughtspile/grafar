(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // fn_utils
    var wrapFn = grafar.wrapFn;
    
    
    var counter = 0;
    
    function Buffer() {
        this.id = counter;
        counter++;
        this.array = new Float32Array(0);
        this.length = 0;
    }
    
    Buffer.map = function(params, target, fn) {
        wrapFn(fn)(params, target);
        return target;
    };
    
    Buffer.prod = function(factors) {        
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
    
    
    Buffer.prototype.resize = function (size) {
        var type = this.array.constructor;
        this.array = new Float32Array(size);
        this.length = size;
        return this;
    };
    
    
    grafar.Buffer2 = Buffer;
}(this));