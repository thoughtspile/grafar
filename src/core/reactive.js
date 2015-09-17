(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from misc.js
    var isExisty = grafar.isExisty;


    var seqCounter = 0;

	var Reactive = function(data) {
        var self = function() { return self.value(); };
        self.sources = [];
		self.data = isExisty(data)? data: {};
		self.fn = function() {};
		self._isValid = false;
        self.updated = seqCounter++;

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
        var selfUpdated = this.updated;
        return this._isValid && this.sources.every(function(src) {
            return src.isValid() && src.updated < selfUpdated;
        });
    };

    Reactive.prototype.lift = function(fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    };

	Reactive.prototype.bind = function() {
        this.unbind();
        this.sources = Array.prototype.slice.call(arguments).map(function(arg) {
            return Reactive.isReactive(arg)? arg: Reactive(arg);
        });
        return this;
    };

    Reactive.prototype.unbind = function() {
        this.sources.length = 0;
        this.invalidate();
        return this;
    };

	Reactive.prototype.validate = function() {
		if (!this.isValid()) {
            // should traverse recursively
            var res = this.fn.apply(this, this.sources.map(function(src) {
                return src();
            }).concat(this.data));
            if (isExisty(res))
                this.data = res;
			this._isValid = true;
            this.updated = seqCounter++;
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
