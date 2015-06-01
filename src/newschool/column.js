(function(global){
    var grafar = global.grafar;
	var parseArray = grafar.parseArray;
    var add = grafar.add;
    var remove = grafar.remove;
    
	var Column = function(length, rule, database) {
        //using = grafar.parseArray(using);
		length = grafar.isExisty(length)? length: 0;
		rule = rule || function() {};
		
        this.database = database;
		this.data = new Float32Array(length);
		this.generator = rule;
		this.isValid = false;
		this.length = length;
        this.children = [];
        this.parents = [];
	};
	
	
	Column.isColumn = function(obj) {
		return obj instanceof Column;
	};
	
	Column.repeat = function(col, factor) {		
		return new Column(0, function(to) {
			col.validate();
			var srcLen = col.length,
				srcData = col.data.subarray(0, srcLen),
				targetLen = srcLen * factor;
			to.resize(targetLen);
			for (var i = 0; i < targetLen; i += srcLen)
				to.data.set(srcData, i);
		});
	};
	
	Column.stretch = function(col, factor) {	
		return new Column(0, function(to) {
			col.validate();
			var srcLen = col.length,
				srcData = col.data,
				targetLen = srcLen * factor;
			to.resize(targetLen);
			var iFrom = srcLen - 1,
				iTo = targetLen - 1;
			while (iFrom >= 0) {
				var val = srcData[iFrom];
				for (var j = 0; j < factor; j++) {
					to.data[iTo] = val; // fill?
					iTo--;
				}
				iFrom--;
			}
		});
	};
	
	Column.clone = function(col) {
		return new Column(col.length, function(to) { 
			col.validate();
			to.resize(col.length);
			to.data.set(col.data);
		});
	};
	
	Column.cloneDeep = function(col) {
		return new Column(col.length, col.generator);
	};
	
    
	Column.prototype.bindInputs = function(inputs) {
        inputs = _.filter(inputs, Column.isColumn);
        _.forEach(
            inputs, 
            function(input) {
                add(this.parents, input);
                add(input.children, this);
            },
            this
        );
        
        return this;
    };
        
	Column.prototype.resize = function(length, clone) {
		length = grafar.isExisty(length)? length: 0;
		clone = grafar.isExisty(clone)? clone: false;
		
        var temp = new Float32Array(length);
		if (clone) {
            temp.set(this.data.subarray(0, length));
		}
        this.data = temp;
            
		return this;
	};
	
	Column.prototype.invalidate = function() {
		this.isValid = false;
        _.forEach(this.children, function(col) { col.invalidate(); });
		return this;
	};
	
	Column.prototype.validate = function() {
		if (!this.isValid) {
            _.forEach(this.parents, function(col) { col.validate(); });
            //var data = this.database.select(this.using);
			this.generator(this);
			this.isValid = true;
		}
		return this;
	};
	
	
	grafar.Column = Column;
}(this));