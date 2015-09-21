(function(global){
    // from grafar.js
    var grafar = global.grafar;
    // from misc.js
    var isExisty = grafar.isExisty;
    var deepFilter = grafar.deepFilter;
    var deepForEach = grafar.deepForEach;
    var deepMap = grafar.deepMap;
    var deepKeyAssign = grafar.deepKeyAssign;


    var isDeepLeaf = function(el) {
        return !isExisty(el) ||
            (isExisty(el.buffer) && el.buffer instanceof ArrayBuffer) ||
            Reactive.isReactive(el);
    };


    var seqCounter = 0;

	var Reactive = function(data) {
        var self = function() { return self.value(); };
        Object.keys(Reactive.prototype).forEach(function(prop) {
            self[prop] = Reactive.prototype[prop];
        });

        self.sources = [];
        self.args = [];
        self.structuredSources = {};
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

	Reactive.prototype.sbind = function(/* args */) {
        this.context = arguments[0];
        this.args = Array.prototype.slice.call(arguments, 1);
        this.sources = deepFilter(this.args, Reactive.isReactive, isDeepLeaf);
        var structuredSources = {};
        deepForEach(this.args, function(el, key) {
            if (Reactive.isReactive(el))
                structuredSources[key] = el;
        }, isDeepLeaf)
        this.structuredSources = structuredSources;
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
            this.args
            Object.keys(this.structuredSources).forEach(function(key) {
                deepKeyAssign(this.args, key, this.structuredSources[key]());
            }.bind(this));
            var res = this.fn.apply(this.context, this.args.concat(this.data));
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
