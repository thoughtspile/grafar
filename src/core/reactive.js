(function(global){
    var grafar = global.grafar;
    var isExisty = grafar.isExisty;
    var setPop = grafar.setpop;
    var setPush = grafar.setpush;
    var union = grafar.union;
    var repeatArray = grafar.repeatArray;
    var stretchArray = grafar.repeatPoints;
    var blockRepeat = grafar.blockRepeat;
    
   
	var Reactive = function(data) {
        this.sources = [];
        this.targets = [];
        
		this.data = isExisty(data)? data: {};
		this.fn = function() {};
		this.isValid = false;
	};
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
    
    
    Reactive.prototype.push = function() {
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
            var sourceData = [];
            for (var i = 0; i < this.sources.length; i++) {
                sourceData[i] = this.sources[i].value();
            }
            var res = this.fn(sourceData, this.data);
            if (isExisty(res))
                this.data = res;
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
    
    
	grafar.Reactive = Reactive;
}(this));