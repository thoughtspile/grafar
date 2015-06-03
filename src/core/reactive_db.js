'use strict';
	
(function(global) {
	var _G = global.grafar;
    var asArray = _G.asArray;
    var Reactive = _G.Reactive;
	
	
	function Database() {
		this.reactives = {};
	};
	
	Database.prototype.constrain = function(constraint) {
		var names = asArray(constraint.what || []),
			using = asArray(constraint.using || []),
			as = constraint.as || function() {},
			maxlen = constraint.maxlen;
            
        if (names.length > 1)
            throw new Error('cannot define > 1');
        var sources = [];
        for (var i = 0; i < using.length; i++) {
            if (!this.reactives.hasOwnProperty(using[i]))
                this.reactives[using[i]] = new Reactive();
            sources[i] = this.reactives[using[i]];
        }
        if (!this.reactives.hasOwnProperty(names[0]))
            this.reactives[names[0]] = new Reactive();
        
        var compatibilityAs = function(par, out, l) {
            out.buffer(par.length === 0? maxlen: par[0].length);
            var data = {};
            for (var i = 0; i < using.length; i++)
                data[using[i]] = par[i].value();
            data[names[0]] = out.data;
            as(data, out.length, {});
        };
        
        this.reactives[names[0]]
            .lift(compatibilityAs)
            .bind(Reactive.unify(sources));

		return this;
	};
	
	Database.prototype.select = function(names) {
        var names = asArray(names || []);
        var temp = [];        
        for (var i = 0; i < names.length; i++) {
            if (!this.reactives.hasOwnProperty(names[i]))
                throw new Error('cannot select undefined');
            temp[i] = this.reactives[names[i]];
        }
		var unifiedReactives = Reactive.unify(temp);
        var data = {};
        for (var i = 0; i < names.length; i++)
            data[names[i]] = unifiedReactives[i].validate();
        return data;
	};
    
			
	_G.DatabaseR = Database;
}(this));