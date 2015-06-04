'use strict';
	
(function(global) {
	var _G = global.grafar;
    var Reactive = _G.Reactive;
	
	
	function Topo() {
        Reactive.call(this);
	};
    
    Topo.prototype = Reactive;
    
    
	_G.Topo = Topo;
}(this));