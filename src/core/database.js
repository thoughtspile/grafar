'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		isExisty = _G.isExisty,
		asArray = _G.asArray,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = {};
		this.schema = {};
		this.updates = [];
		this.requests = [];
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
		for (var i = 1; i < tabs.length; i++) {
			temp = temp.times(tabs[i]);
		}

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