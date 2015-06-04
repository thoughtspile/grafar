(function(global){
    var grafar = global.grafar;
    var isExisty = grafar.isExisty;
    var setPop = grafar.setpop;
    var setPush = grafar.setpush;
    var union = grafar.union;
    var repeatArray = grafar.repeatArray;
    var stretchArray = grafar.repeatPoints;
    var blockRepeat = grafar.blockRepeat;
    
   
	var Reactive = function() {
        this.sources = [];
        this.targets = [];
        
		this.data = new Float32Array(0);
        this.length = 0;
		this.fn = function() {};
		this.isValid = false;
	};
	
    var baseOrder = [],
        baseComparator = function(a, b) {
            return baseOrder.indexOf(a) >= baseOrder.indexOf(b);
        };
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
    
    Reactive.contextify = function(col, targetBase) {
        return new Reactive().lift(function(par, out) {
            var colBase = col.base().sort(baseComparator),
                totalLength = targetBase.reduce(function(pv, cv) {
                    return pv * cv.validate().length;
                }, 1),
                blockSize = 1,
                len = par[0].length;
            var res = out.buffer(totalLength).data;
            res.set(par[0].value());
            for (var i = 0; i < targetBase.length; i++) {
                if (colBase.indexOf(targetBase[i]) === -1) {
                    blockRepeat(
                        res, 
                        blockSize, 
                        Math.floor(len / blockSize),
                        targetBase[i].length,
                        res
                    );
                    len *= targetBase[i].length;
                }
                blockSize *= targetBase[i].length;
            }
        }).bind([col]);
    };
    
    Reactive.unify = function(cols) {
        var targetBase = cols.reduce(function(pv, col) {
            return union(pv, col.base());
        }, []).sort(baseComparator);
        return cols.map(function(col) {
            return Reactive.contextify(col, targetBase);
        });
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
        this.invalidate();
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
        this.invalidate();
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
        if (this.sources.length === 0) {
            // register for global ordering
            // might cause memory leaks
            baseOrder.push(this);
            return [this];
        }
        return this.sources.reduce(function(pv, node) {
            return union(pv, node.base());
        }, []);
    };
    
    
	grafar.Reactive = Reactive;
}(this));