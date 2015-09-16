(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from misc.js
    var isExisty = grafar.isExisty;


	var Reactive = function(data) {
        var self = function() { return self.value(); };
        self.sources = [];
		self.data = isExisty(data)? data: {};
		self.fn = function() {};
		self._isValid = false;

        Object.keys(Reactive.prototype).forEach(function(prop) {
            self[prop] = Reactive.prototype[prop];
        });

        return self;
	};

	Reactive.isReactive = function(obj) {
		return Boolean(obj) && Object.keys(Reactive.prototype)
            .every(function(prop) {
                return obj[prop] === Reactive.prototype[prop];
            });
	};


    Reactive.prototype.isValid = function() {
        return this._isValid && this.sources.reduce(function(state, src) {
            return state && src.isValid();
        }, true);
    };

    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    };

	Reactive.prototype.bind = function(newArgs) {
        this.unbind();
        this.sources = newArgs.slice();
        return this;
    };

    Reactive.prototype.unbind = function() {
        this.sources.length = 0;
        this.invalidate();
        return this;
    };

	Reactive.prototype.validate = function() {
		if (!this.isValid()) {
            var res = this.fn(this.sources.map(function(src) {
                return src.value();
            }), this.data);
            if (isExisty(res))
                this.data = res;
			this._isValid = true;
		}
		return this;
	};

	Reactive.prototype.invalidate = function() {
		this._isValid = false;
		return this;
	};

    Reactive.prototype.value = function() {
        return this.validate().data;
    };


	grafar.Reactive = Reactive;
}(this));
