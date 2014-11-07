'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = {}; // all tables stored by id
		this.vars = {}; // all tables stored by ref vars
		this.needsUpdate = {}; // upflags by var
		this.depend = {}; // dependancy graph
		this.containers = {}; // dunno
		this.schema = {}; // definitions
		
		this.updates = []; // queue of pending updtes
		this.requests = []; // select queue
	}
	
	Database.prototype = new Observable();
	
	Database.prototype.addDependency = function(source, target) {
		if (!isExisty(this.depend[source]))
			this.depend[source] = [];
		if(this.depend[source].indexOf(target) === -1)
			this.depend[source].push(target);
		return this;
	};
	
	Database.prototype.define = function(query) {
		//console.log('d-call');
		var names = asArray(query.what || []),
			using = asArray(query.using || []),
			as = query.as || function() {},
			maxlen = query.maxlen,
			dynamic = query.dynamic || true,
			redefine = query.redefine || 'merge';
		// Actually it's using OR maxlen
		
		for (var i = 0; i < using.length; i++) {
			for (var j = 0; j < names.length; j++)
				this.addDependency(using[i], names[j]);
			this.schema[using[i]].children.push.apply(names);
		}
			
		var def = {
			what: names,
			parents: using,
			children: [],
			as: as,
			maxlen: maxlen
		};
		// maybe def should be a table of some perverse sort
		
		for (var i = 0; i < names.length; i++) {
			var oldtab = this.tables[names[i]];
			if (isExisty(oldtab))
				oldtab.dropCol(names[i]);
			this.schema[names[i]] = def;
			this.vars[names[i]] = this.vars[names[i]] || [];
		}

		//console.log('d-ret');
		return this;
	};
	
	// Planning (against select queue):
	//   1. Cascade requests.
	//   2. Extend groups.
	//   3. Order by inclusion
	//   4. Resolve table references
	// Update:
	//   1. just set needsupdate flags for cols
	// Export:
	//   EITHER only copy the components that have changed
	//   OR use event listener for each col
	//   OR ok i dunno
	// Aside:
	//   * each col exists as a master and its *repeat copies
	//   * is there a minimal table for req?
	//   * include all ancestors brfore times
	
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
	
	Database.prototype.select = function(names) {
		//console.log('s-call', names);
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		var tabs = [],
			rating = {};
		for (var i = 0; i < names.length; i++) {			
			var name = names[i],
				tab = this.tables[names[i]];
			if (isExisty(tab)) {
				tab.refresh(name, this.schema[names[i]].as);
				if (tabs.indexOf(tab) === -1)
					tabs.push(tab);
			} else {
				var def = this.schema[names[i]];
				tab = this.select(def.parents).setLength(def.maxlen).addCol(def.what, def.as);
				for (var j = 0; j < def.what.length; j++)
					this.tables[def.what[j]] = tab;
				tabs.push(tab);
			}
		}
		
		var totalCoverage = 0;
		while(totalCoverage < names.length) {
			var containers = this.vars[name];		
			for (var i = 0; i < containers.length; i++) {
				var tabId = containers[i]
					rating[tabId] = isExisty(rating[tabId])? rating[tabId] + 1: 1;
			}
			
			var tabIds = Object.keys(rating),
				bestFit = '',
				bestCoverage = 0;
			
			for (var i = 0; i < tabIds.length; i++) {
				if (rating[tabIds[i]] > bestCoverage) {
					bestFit = tabIds[i];
					bestCoverage = rating[tabIds[i]];
				}
				totalCoverage += bestCoverage;
			}
		}
		
		var temp = tabs[0];
		for (var i = 1; i < tabs.length; i++)
			temp = temp.times(tabs[i]);

		//console.log('s-ret');
		return temp;
	};
	
	
	Database.prototype.postRequest = function() {
		return this;
	};
	
	Database.prototype.postUpdate = function() {
		return this;
	};
	
	
	_G.Database = Database;
}(this));