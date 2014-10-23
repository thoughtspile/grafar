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
	
	
	Database.prototype.define = function(query) {
		//console.log('d-call');
		var names = asArray(query.what || []),
			using = asArray(query.using || []),
			as = query.as || function() {},
			maxlen = query.maxlen,
			dynamic = query.dynamic || true,
			redefine = query.redefine || 'merge';
		// Actually it's using OR maxlen
		
		for (var i = 0; i < using.length; i++)
			this.schema[using[i]].children.push.apply(names);
			
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
	
	Database.prototype.select = function(names) {
		//console.log('s-call', names);
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		var tabs = [];
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