(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from misc.js
    var isExisty = grafar.isExisty;
    
   
	var Reactive = function(data) {
        this.sources = [];        
		this.data = isExisty(data)? data: {};
		this.fn = function() {};
		this._isValid = false;
	};
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
    
    
    Reactive.prototype.isValid = function() {
        return this._isValid && this.sources.reduce(function(state, src) {
            return state && src.isValid();
        }, true);
    };

    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    };
    
	Reactive.prototype.bind = function(newArgs) {        
        this.unbind();
        this.sources = newArgs.slice();
        return this;
    };
    
    Reactive.prototype.unbind = function() {
        this.sources.length = 0;
        this.invalidate();
        return this;
    };
    
	Reactive.prototype.validate = function() {
		if (!this.isValid()) {
            var res = this.fn(this.sources.map(function(src) {
                return src.value();
            }), this.data);
            if (isExisty(res))
                this.data = res;
			this._isValid = true;
		}
		return this;
	};
	
	Reactive.prototype.invalidate = function() {
		this._isValid = false;
		return this;
	};
    
    Reactive.prototype.value = function() {
        return this.validate().data;
    };
    
    
	grafar.Reactive = Reactive;
}(this));