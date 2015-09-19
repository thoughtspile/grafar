(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from misc.js
    var isExisty = grafar.isExisty;


    var seqCounter = 0;

	var Reactive = function(data) {
        var self = function() { return self.value(); };
        Object.keys(Reactive.prototype).forEach(function(prop) {
            self[prop] = Reactive.prototype[prop];
        });

        self.sources = [];
		self._isValid = false;
        self.computedOn = -Infinity;
        self.context = null;

        self.lift(data);
        self.cache();

        return self;
	};

	Reactive.isReactive = function(obj) {
		return Boolean(obj) && Object.keys(Reactive.prototype)
            .every(function(prop) {
                return obj[prop] === Reactive.prototype[prop];
            });
	};


    Reactive.prototype.isValid = function() {
        var selfComputedOn = this.computedOn;
        return this._isValid && this.sources.every(function(src) {
            return src.isValid() && src.computedOn < selfComputedOn;
        });
    };

    Reactive.prototype.lift = function(fn) {
        this.fn = fn instanceof Function? fn: function() { return fn; };
        this.invalidate();
        return this;
    };

    Reactive.prototype.cache = function(data) {
        this.data = data;
        this.invalidate();
        return this;
    };

    // how does this react to rebinding to updated?
    // should return clone perhaps

	Reactive.prototype.sbind = function(/* args */) {
        // why not reactive?
        this.context = arguments[0];
        // traverse
        this.sources = Array.prototype.slice.call(arguments, 1).map(function(arg) {
            return Reactive.isReactive(arg)? arg: Reactive(arg);
        });
        this.invalidate();
        return this;
    };

	Reactive.prototype.bind = function(/* args */) {
        var other = new Reactive()
            .lift(this.fn)
            .cache(this.data);
        other.sbind.apply(other, arguments);
        other._isValid = this._isValid;
        other.computedOn = this.computedOn;
        return other;
    };

	Reactive.prototype.validate = function() {
		if (!this.isValid()) {
            // should traverse recursively
            var res = this.fn.apply(this.context || this.data, this.sources.map(function(src) {
                return src();
            }).concat(this.data));
            if (isExisty(res))
                this.data = res;
			this._isValid = true;
            this.computedOn = seqCounter++;
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
