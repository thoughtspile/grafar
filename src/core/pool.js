(function(global) {
	var grafar = global.grafar;


	var arrayPool = {
		arrays: [],

		get: function(Constructor, length) {
			for (var i = 0; i < this.arrays.length; i++) {
				var cand = this.arrays[i];
				if (cand.constructor === Constructor && cand.length === length)
					return this.arrays.splice(i, 1)[0];
			}
			return new Constructor(length);
		},

		push: function(obj) {
			this.arrays.push(obj);
		},

		swap: function(arr, length) {
			var type = arr.constructor;
			this.push(arr);
			return this.get(type, length);
		},

		flush: function() {
			this.pool.length = 0;
		}
	};


	grafar.pool = arrayPool;
}(this));
