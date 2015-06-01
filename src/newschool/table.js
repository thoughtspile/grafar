(function(global){
	var grafar = global.grafar;
	var parseArray = grafar.parseArray;
	var isExisty = grafar.isExisty;
	var Column = grafar.Column;
	
	
	var Table = function() {
		this.columns = {};
		this.length = 0;
	};
	
	
	Table.isTable = function(obj) {
		return obj instanceof Table;
	}
	
	Table.times = function(tab1, tab2) {
		var result = new Table(),
			len1 = tab1.length,
			len2 = tab2.length;//,
			//columns = _.union(_.keys(this.columns), _.keys(table2.columns));
		_.forOwn(tab1.columns, function(col) {
			result.insert(Column.stretch(col, len1));
		});
		_.forOwn(tab2.columns, function(col) {
			result.insert(Column.repeat(col, len2));
		});
		return result;
	};
	
	
	Table.prototype.hasColumn = function(name) {
		return isExisty(this.columns[name]);
	};
	
	Table.prototype.project = function(colNames) {
		return _.reduce(
			parseArray(colNames),
			function(proj, colName) {
				return proj.insert(this.columns[colName]);
			},
			new Table(),
			this
		);
	};
	
	Table.prototype.insert = function(name, col) {
		if (Column.isColumn(col))
			this.columns[name] = col;
		else if (_.isString(col))
			this.columns[col] = new Column(col, this.length);
		this.length = this.columns.length > 1? Math.min(this.length, col.length): col.length;
		return this;
	};
		
	Table.prototype.row = function(i, buff) {
		buff = buff || {};
		
		this.validate();
		_.forOwn(this.columns, function(col, name) {
			buff[name] = col.data[i];
		});
		
		return buff;
	};
	
	Table.prototype.rowArr = function(i, buff) {
		buff = buff || [];
		
		this.validate();
		var colNames = _.keys(this.columns);
		for (var j = 0; j < colNames.length; j++)
			buff[j] = this.columns[colNames[j]].data[i];
		
		return buff;
	};
	
    Table.prototype.data = function() {
        return _.clone(this.columns);
    };
    
	Table.prototype.validate = function() {
		_.forEach(this.columns, function(col) { col.validate(); });
		return this;
	}
	
	
	global.grafar.Table = Table;
}(this));