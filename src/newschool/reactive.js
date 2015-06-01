(function(global){
    var grafar = global.grafar;
	var parseArray = grafar.parseArray;
    var add = grafar.add;
    var remove = grafar.remove;
    var GraphNode = grafar.GraphNode;
    
    
    var lift = function(fn) {
        return new Reactive().lift(fn);
    };
    
	var Reactive = function() {
        GraphNode.call(this);
    
		this.data = new Float32Array(0);
		this.fn = function() {};
        this.length = 0;
		this.isValid = false;
	};
	
	
	Reactive.isReactive = function(obj) {
		return obj instanceof Reactive;
	};
	
	Reactive.repeat = function(col, factor) {
        var srcLen = col.length,
            targetLen = srcLen * factor;
		return lift(function(src, target, len) {
			for (var i = 0; i < len; i += srcLen)
				target.set(src[0].data, i);
		}).buffer(targetLen).bind([col]);
	};
	
	Reactive.stretch = function(col, factor) {
        var srcLen = col.length,
            targetLen = srcLen * factor;
		return lift(function(src, target, len) {
			var iFrom = srcLen - 1,
				iTo = targetLen - 1;
			while (iFrom >= 0) {
				var val = src[0].data[iFrom];
				for (var j = 0; j < factor; j++, iTo--)
					target[iTo] = val;
				iFrom--;
			}
		}).buffer(targetLen).bind([col]);
	};
	
    Reactive.times = function(factors) {
        var res = factors.slice();
        var factorCount = res.length;
        var factorSizes = _.map(res, 'length');
        for (var i = 0; i < factorCount; i++) {
            for (var ops = 0; ops < factorCount - 1; ops++)
                res[i] = Reactive[ops < i? 'repeat': 'stretch'](
                    res[i], 
                    factorSizes[(i + ops + 1) % factorCount]
                );
        }
        return res;
    };
    
    
	Reactive.prototype.buffer = function(length, cloneFlag) {
		length = grafar.isExisty(length)? length: 0;
		cloneFlag = grafar.isExisty(cloneFlag)? cloneFlag: false;
		
        var temp = new Float32Array(length);
		if (cloneFlag) {
            temp.set(this.data.subarray(0, length));
		}
        this.length = length;
        this.data = temp;
            
		return this;
	};
    
    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        return this;
    };
    
	Reactive.prototype.bind = function(inputs) {
        inputs = _.isArray(inputs)? inputs: [inputs];
        
        this.unbind();
        
        _.forEach(
            inputs, 
            function(parent) {
                GraphNode.edge(parent, this);
            },
            this
        );
        
        return this;
    };
    
    Reactive.prototype.unbind = function() {
        _.forEach(
            this.parents, 
            function(parent) {
                GraphNode.removeEdge(parent, this);
            },
            this
        );
        
        return this;
    };
    	    	
	Reactive.prototype.validate = function() {
		if (!this.isValid) {
            var rawInputs = _.map(this.parents, function(parent) {
                return parent.value();
            });
            this.fn(this.parents, this.data, this.length);
			this.isValid = true;
		}
		return this;
	};
	
	Reactive.prototype.invalidate = function() {
		this.isValid = false;
        _.forEach(this.children, function(col) { col.invalidate(); });
		return this;
	};
    
    Reactive.prototype.value = function() {
        return this.validate().data;
    };
    
    
    grafar.lift = lift;
	grafar.Reactive = Reactive;
}(this));