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
		// def should be a table of some perverse sort
		
		for (var i = 0; i < names.length; i++)
			this.schema[names[i]] = def;
		
		return this;
	};
	
	Database.prototype.select = function(names) {
		names = asArray(names);
		
		// return a table: names \subset cols(table)
		// 1. find min set of tables: names \subset union(cols(tables))
		//   1.1. find descriptions: names \subset union(what(descriptions))
		//   1.2. evaluate descriptions:
		//     1.2.1. get in = select(using)
		//     1.2.2. apply description to in
		// 2. return product(tables)
		//
		// select() = new Table2();
		
		var temp = new Table2(),
			descriptors = [];
			
		if (names.length > 0) {
			for (var i = 0; i < names.length; i++) {
				var def = this.schema[names[i]];
				if (descriptors.indexOf(def) === -1)
					descriptors.push(def);
			}
			for (var i = 0; i < descriptors.length; i++) {
				var def = descriptors[i];
				temp.times(this.select(def.parents).setLength(def.maxlen).addCol(def.what, def.as));
			}
		}
		
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