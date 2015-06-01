(function(global) {
	var grafar = global.grafar || {};
	
	
	function Interleaved() {
		this.data = new Float32Array(0);
		this.itemSize = 0;
		this.itemCount = 0;
	};
	
	Interleaved.prototype.resize = function(newItemCount) {
		if (this.data.length < newItemCount * this.itemSize) {
			this.data = new Float32Array(newItemCount * this.itemSize);
		}
		this.itemCount = newItemCount;
		return this;
	};
	
	Interleaved.prototype.resizeItem = function(newItemSize) {
		if (this.data.length < this.itemCount* newItemSize) {
			this.data = new Float32Array(this.itemCount* newItemSize);
		}
		this.itemSize = newItemSize;
		return this;
	};
	
	
	grafar.Interleaved = Interleaved;
}(this));