(function(global){
    var grafar = global.grafar;
    var isExisty = grafar.isExisty;
    var setPop = grafar.setpop;
    var setPush = grafar.setpush;
    var union = grafar.union;
    var repeatArray = grafar.repeatArray;
    var stretchArray = grafar.repeatPoints;
    
   
	var Reactive = function() {
        this.sources = [];
        this.targets = [];
        
		this.data = new Float32Array(0);
        this.length = 0;
		this.fn = function() {};
		this.isValid = false;
	};
	
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
	
	Reactive.repeat = function(col, factor) {
        var srcLen = col.length,
            targetLen = srcLen * factor;
		return new Reactive()
            .lift(function(src, target, len) {
                for (var i = 0; i < len; i += srcLen)
                    target.data.set(src[0].data, i);
            })
            .buffer(targetLen)
            .bind([col]);
	};
	
	Reactive.stretch = function(col, factor) {
        var srcLen = col.length,
            targetLen = srcLen * factor;
		return new Reactive()
            .lift(function(src, target, len) {
                var iFrom = srcLen - 1,
                    iTo = targetLen - 1;
                while (iFrom >= 0) {
                    var val = src[0].data[iFrom];
                    for (var j = 0; j < factor; j++, iTo--)
                        target.data[iTo] = val;
                    iFrom--;
                }
            })
            .buffer(targetLen)
            .bind([col]);
	};
	
    Reactive.prod = function(factors) {
        var res = [];
        var factorCount = factors.length;
        if (factorCount === 1)
            return factors;
        
        var factorSizes = [];
        for (var  i = 0; i < factors.length; i++)
            factorSizes[i] = factors[i].length;
            
        for (var i = 0; i < factorCount; i++) {
            for (var ops = 0; ops < factorCount - 1; ops++)
                res[i] = Reactive[ops < i? 'repeat': 'stretch'](
                    factors[i],
                    factorSizes[(i + ops + 1) % factorCount]
                );
        }
        return res;
    };
    
    
	Reactive.prototype.buffer = function(length) {
		length = isExisty(length)? length: 0;
        this.length = length;
        this.data = new Float32Array(length);
        this.invalidate();
		return this;
	};
    
    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        return this;
    };
    
	Reactive.prototype.bind = function(newArgs) {        
        this.unbind();
        for (var i = 0; i < newArgs.length; i++)
            setPush(newArgs[i].targets, this);
        this.sources = newArgs.slice();        
        return this;
    };
    
    Reactive.prototype.unbind = function() {
        for (var i = 0; i < this.sources.length; i++)
            setPop(this.sources[i].targets, this);      
        this.sources.length = 0;
        return this;
    };
            	    	
	Reactive.prototype.validate = function() {
		if (!this.isValid) {
            for (var i = 0; i < this.sources.length; i++)
                this.sources[i].validate();
            this.fn(this.sources, this, this.length);
			this.isValid = true;
		}
		return this;
	};
	
	Reactive.prototype.invalidate = function() {
		this.isValid = false;
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i].isValid)
                this.targets[i].invalidate();
		return this;
	};
    
    Reactive.prototype.value = function() {
        return this.validate().data;
    };
    
    Reactive.prototype.base = function() {
        if (this.sources.length === 0)
            return [this];
        return this.sources.reduce(function(pv, node) {
            return union(pv, node.base());
        }, []);
    };
    
	grafar.Reactive = Reactive;
}(this));