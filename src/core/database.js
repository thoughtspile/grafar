'use strict';
	
(function(global) {
	var _G = global.grafar,
		Observable = _G.Observable,
		Table2 = _G.Table2;
	
	
	function Database(opts) {
		Observable.call(this);
		
		this.tables = [];
	}
	
	Database.prototype = new Observable();
	
	Database.prototype.define = function(names, generator) {
		if (Array.isArray(names)) {
			this.tables.push(new Table2());
		} else if (names == '*') {
		} else {
		}
		return this;
	};
	
	Database.prototype.select = function(query) {
		return this;
	};
	
	Database.prototype.postRequest = function() {
		return this;
	};
	
	Database.prototype.postUpdate = function() {
		return this;
	};
	
	
	_G.Database = Database;
}(this));