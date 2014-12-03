'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		intersection = _G.intersection,
		interPower = _G.interPower,
		haveCommon = _G.haveCommon,
		union = _G.union,
		firstMatch = _G.firstMatch,
		GraphData = _G.GraphData,
		setMinus = _G.setMinus,
		setpush = _G.setpush,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = [];
		this.constraints = [];
		this.known = {};
		this.graph = new GraphData();
	}
	
	Database.prototype = new Observable();
	
	Database.prototype.constrain = function(constraint) {
		//console.log('c in');
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen,
			isExplicit = !haveCommon(names, using),
			fn = constraint.fn || function() { return 0; },
			onConflict = 'overwrite';
			
		var conflicts = this.constraints.filter(function(c) {
				return haveCommon(c.what, names);
			}),
			def = {
				what: names, // is the matching connectivity component
				as: as,
				baseTable: null,
				using: using,
				maxlen: maxlen // only for root CCs
			};
		//console.log('c', def);
		
		if (conflicts.length !== 0) {
			if (onConflict === 'overwrite') {
				this.constraints = setMinus(this.constraints, conflicts);
				// only psubs
				def.baseTable = conflicts[0].baseTable;
				console.log('tab', def.baseTable);
			}
			// Merge dupe explicit: x = f(v) <- x = g(v): add f(v) = g(v)
			// Adding i to e: x = f(v) <- f(x, v) = g(u): Will cascade
			// Adding i to i: F(v) = 0 <- G(v) = 0: OK for ConComp
		}
		this.constraints.push(def);
		
		for (var i = 0; i < names.length; i++) {
			var name = names[i];
			this.known[name] = false; // tabwise

			this.graph.addNode(name);
			for (var j = 0; j < using.length; j++)
				this.graph.addEdge(using[j], name);
		}
		
		//console.log('cascade');
		var cascadeChanges = this.graph.down(names);
		for (var i = 0; i < cascadeChanges.length; i++)
			this.known[cascadeChanges[i]] = false;
		this.setUpdate(names);

		//console.log('c out');
		return this;
	};
	
	Database.prototype.select = function(names) {
		names = asArray(names);
		
		if (names.length === 0)
			return new Table2();
			
		// evaluate all definitions
		// problem: r-copies of atomic table remain the same!
		for (var i = 0; i < names.length; i++) {
			if (!this.known[names[i]]) { // tabwise ups
				var def = firstMatch(this.constraints, function(c) {
						return c.what.indexOf(names[i]) !== -1;
					});
				if (!isExisty(def.baseTable)) {
					var parents = this.graph.to[names[i]], // is name enough?
						tab = this.select(parents).resize(def.maxlen).define(def.what, def.using, def.as);
					// OLD TABLE REMAINS    !!!!!!!!!!!!!!!!!!!!!!
					//console.log('redefine', def.as.id);
					//this.tables = []; // THIS IS LIKE EVEN WORSE   !!!!!!!!!!!!!!!!!!!!!
					setpush(this.tables, tab);
					def.baseTable = tab;
				} else {
					def.baseTable.define(def.what, def.using, def.as);
				}
				for (var j = 0; j < def.what.length; j++)
					this.known[def.what[j]] = true;
			}
		}
		
		// select best tables
		var tabs = [];
		while (names.length > 0) {
			var bestRate = 0, 
				tab = null;
			for (var i = 0; i < this.tables.length && bestRate < names.length; i++) {
				var rate = interPower(this.tables[i].schema(), names);
				if (rate > bestRate) {
					bestRate = rate;
					tab = this.tables[i];
				}
			}
			tabs.push(tab);
			names = setMinus(names, tab.schema());
		}
		
		// multiply
		var temp = tabs[0];
		for (var i = 1; i < tabs.length; i++) {
			temp = temp.times(tabs[i]);
			this.tables.push(temp);
		}
		
		return temp;
	};
	
	Database.prototype.setUpdate = function(names) {
		var affected = union(names, this.graph.down(names));
		for (var i = 0; i < this.tables.length; i++)
			for (var j = 0; j < affected.length; j++) {
				this.tables[i].needsupdate[affected[j]] = true;
			}
	};
		
	Database.prototype.prepare = function() {
		// Inline explicits into implicits where possible.
		// Group CCs.
	};
	
	
	Database.prototype.postSelect = function() {
		
	};
			
	_G.Database = Database;
}(this));