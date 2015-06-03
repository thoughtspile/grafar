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
	
    var baseOrder = [];
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
	    
    Reactive.contextify = function(col, targetBase) {
        // sort target base
        var colBase = col.base(),
            res = col;
        for (var i = 0; i < targetBase.length; i++) {
            if (colBase.indexOf(targetBase[i]) === -1) {
                var iLoc = i,
                    getBlockSize = function() {
                        var res = 1;
                        for (var j = 0; j < iLoc; j++)
                            res *= targetBase[j].length;
                        return res;
                    };
                res = new Reactive().lift(function(par, out) {
                    out.buffer(par[0].length * par[1].length);
                    var blockSize = getBlockSize();
                    blockRepeat(
                        par[0].value(), 
                        blockSize, 
                        Math.floor(par[0].length / blockSize),
                        par[1].length,
                        out.data
                    );
                }).bind([res, targetBase[i]]);
            }
        }
        return res;
    };
    
    Reactive.unify = function(cols) {
        var targetBase = cols.reduce(function(pv, col) {
            return union(pv, col.base());
        }, []).sort(function(a, b) {
            return baseOrder.indexOf(a) >= baseOrder.indexOf(b);
        });
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
        if (this.sources.length === 0) {
            baseOrder.push(this);
            return [this];
        }
        return this.sources.reduce(function(pv, node) {
            return union(pv, node.base());
        }, []);
    };
    
    
	grafar.Reactive = Reactive;
}(this));