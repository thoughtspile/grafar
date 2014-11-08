'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		intersection = _G.intersection,
		setMinus = _G.setMinus,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = [];
		this.constraints = {};
		this.known = {};
	}	
	
	Database.prototype = new Observable();
	
	Database.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen;
			
		var def = {
			what: names,
			parents: using,
			children: [],
			as: as,
			maxlen: maxlen
		};
		
		for (var i = 0; i < names.length; i++) {
			this.constraints[names[i]] = def;
			this.known[names[i]] = false;
		}

		return this;
	};
	
	Database.prototype.select_ = function(names) {
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		for (var i = 0; i < names.length; i++) {
			if (!this.known[names[i]]) {
				var def = this.constraints[names[i]],
					tab = this.select_(def.parents).setLength(def.maxlen).addCol(def.what, def.as);
				if (def.parents.length === 0)
					this.tables.push(tab);
				for (var j = 0; j < def.what.length; j++)
					this.known[def.what[j]] = true;
			}
		}
		
		var tabs = [];
		while (names.length !== 0) {
			var bestRate = 0, 
				bestI = null;
			for (var i = 0; i < this.tables.length && bestRate < names.length; i++) {
				var rate = intersection(this.tables[i].schema(), names).length;
				if (rate > bestRate) {
					bestRate = rate;
					bestI = i;
				}
			}
			
			var tab = this.tables[bestI];
			tabs.push(tab);
			names = setMinus(names, tab.schema());
		}
		
		var temp = tabs[0];
		for (var i = 1; i < tabs.length; i++)
			temp = temp.times(tabs[i]);
		if (tabs.length > 1)
			this.tables.push(temp);
			
		return temp;
	};
		
	// Planning as of 07.11.14
	//
	// I. Global:
	//   1. Merge duplicate explicits
	//     1*. Choose a simpler function
	//   2. Inline explicits into implicits while possible.
	//   3. Group implicits.
	// II. Local (request r recieved):
	//   1. Ensure that all the target variables are known and updated
	//   2. Make a list of all the tables containing r:
	//     2.1. Find the best match table T
	//     2.2. Exclude cols(T) from request
	//   3. Compute the product 
	
	// Need:
	//   list of all tables
	//   list of all constraints
	//   max size for each definition
	//   dependancy graph
	//   implicit / explicit flag
	
	// Problems as of 08.11.14:
	//   All the col instances should have independent needsupdate
	//   Update needs cascade down
	//   No static resoliving
		
	_G.Database = Database;
}(this));