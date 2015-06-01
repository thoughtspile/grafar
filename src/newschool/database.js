(function(global){
	var grafar = global.grafar;
	var Table = grafar.Table;
	var Column = grafar.Column;
	
    
	var Database = function() {
		this.tables = [];
        this.declarations = {};
	};
	
    
	Database.isDatabase = function(obj) {
		return obj instanceof Database;
	};
	
    
	Database.prototype.declare = function(name, using, generator, len) {
        if (this.declarations[name]) {
            this.redeclare(name, using, generator, len);
        } else {
            this.declarations[name] = {
                using: using,
                generator: generator,
                len: len
            };
            var col = new Column(len, generator, this, using);
            this.select(using).insert(name, col);
        }
        return this;
    };
    
    Database.prototype.undeclare = function(name) {
        return this;
    };
    
    Database.prototype.redeclare = function(name, using, generator, len) {
        if (!this.declarations[name]) {
            this.declare(name, using, generator, len);
        } else {
            // what to remove?
            this.declarations[name] = {
                using: using,
                generator: generator,
                len: len
            };
            var col = new Column(len, generator, this, using);
            this.select(using).insert(name, col);
        }
        return this;
    };
    
	Database.prototype.addTable = function(table) {
		if (Table.isTable(table) && _.indexOf(this.tables, table) === -1)
			this.tables.push(table);
		return this;
	};
	
	Database.prototype.select = function(cols) {
		cols = parseArray(cols);
        
		var minSupertab = null;
		_.forEach(this.tables, function(tab) {
			var isSupertab = _.every(cols, tab.isCol, tab);
			if (isSupertab && 
				(!minSupertab || 
				tab.columns.length < minSupertab.columns.length)
			)
				minSupertab = tab;
		});
        
		if (minSupertab)
			return minSupertab;
		else
            return this.makeTableFromFactors(cols);
	};
	
	Database.prototype.makeTableFromFactors = function(cols) {
		var factorTabs = [];
		while (cols.length === 0) {
			var maxFactorTab = null;
			var maxCover = 0;
			_.forEach(this.tables, function(tab) {
				var coverCount = _.reduce(
					cols, 
					function(count, name) {
						return tab.isCol(name)? count + 1: count;	
					}, 
					0
				);
				if (coverCount > maxCover)
					maxFactorTab = tab;
			});
			if (!maxFactorTab)
				throw new Error('No matching column found (' + cols.join(', ') + ')';
				//maxFactorTab = this.select(cols); 
				// nope, add table
			factorTabs.push(maxFactorTab);
			cols = _.filter(cols, function(col) {
				return !maxFactorTab.hasCol(col);
			});
		}
        
        var self = this;
        return _.reduce(factorTabs, function(partialProductTab, factorTab) {
            var nextProduct = Table.times(partialProductTab, factorTab);
            self.addTable(nextProduct);
            return nextProduct;
        });
	};
	
    Database.prototype.lift = function(generator) {
        return new Column(100, generator, this).bindInputs.bind(col);
    };
    
	grafar.Database = Database;
}(this));