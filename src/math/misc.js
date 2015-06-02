'use strict';

(function(global) {
	var _G = global.grafar;
	
			
	function makeID(obj) {
		while (true) {
			var temp = Math.random().toString(36).substr(2, 9); 
			if (!(temp in obj))
				return temp;
		}
	}
					
	function isExisty(obj) {
		return typeof(obj) !== 'undefined' && obj !== null;
	}
		
	function strToArray (str) {
		if (typeof str === 'string')
			return str.replace(/ /g, '').split(',');
		else 
			return str.filter(isExisty);
	}
	
	
	_G.isExisty = isExisty;
	_G.makeID = makeID;
	_G.asArray = strToArray;
}(this));