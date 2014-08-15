'use strict';

(function(global) {


	Geometry.prototype.create = function(nodes, mode, opts) {
		this.split();
		this.buffer = [];
		this.counter = 0;
		this.interrupt = true;
		setTimeout(function() {this.interrupt = false}.bind(this), 25);
		
		if (this.nodes !== nodes) {
			this.init = false;
			this.nodes = nodes;
			this.mode = mode;
			this.tweenMode = 'idle';
			this.mult = ['p', 'l', 'f'].indexOf(mode) + 1;
			this.geometry = new THREE.BufferGeometry();
			
			this.geometry.addAttribute('position', new THREE.Float32Attribute(nodes * this.mult, 3));
			this.positions = this.geometry.attributes.position.array;
			
			this.geometry.addAttribute('index', new THREE.Uint32Attribute(nodes, 4));
			this.indices = this.geometry.attributes.index.array;
			var m = 270, n = 270; // !!!!!!!!!!!!!!!!
			for (var i = 0, counter = 0; i < n - 1; i++) {
				for (var j = 0; j < m - 1; j++, counter += 4) {
					console.log(i,j);
					this.indices[counter] = i * n + j;
					this.indices[counter + 1] = i * n + (j + 1);
					this.indices[counter + 2] = i * n + j;
					this.indices[counter + 3] = (i + 1) * n + j;
				}			
			}
			
			if (this.scene)
				this.scene.remove(this.object);
			if (mode === 'l') {
				var material = new THREE.LineBasicMaterial({
					color: this.object? this.object.material.color: 'royalblue'
				});
				this.object = new THREE.Line(this.geometry, material, THREE.LinePieces);
			} else {
				var material = new THREE.ParticleBasicMaterial({
					color: this.object? this.object.material.color: 'royalblue',
					size: .05
				});
				this.object = new THREE.ParticleSystem(this.geometry, material);
			}
			
			// preserve visibility
			
			if (this.scene)
				this.scene.add(this.object);
		}
	}
	
	
	
	Geometry.prototype.shrink = function() {
		if (this.counter < this.positions.length) {
			var temp = new Float32Array(this.counter);
			
			console.log('shrink', this.id, this.positions.length, 'into', this.counter);
			
			for (var i = 0; i < this.counter; i++)
				temp[i] = this.positions[i];
			
			this.geometry.attributes.position.array = temp;
			this.positions = temp;
		}
		return this;
	}


	Geometry.prototype.setupTween = function() {
		if (this.tweenMode === 'idle') {
			this.tweenMode = 'setup';
			this.oldPositions = this.positions;
			this.positions = new Float32Array(this.nodes * this.mult * 3);
		}
	}
	
	Geometry.prototype.startTween = function() {
		if (this.tweenMode === 'setup') {
			this.tweenMode = 'active';
			this.tweenStart = ST();
			this.newPositions = this.positions;
						
			this.positions = new Float32Array(this.positions.length);
			this.geometry.attributes.position.array = this.positions;
			
			setTimeout(this.proceedTween.bind(this), 25);
		}
	}
	
	Geometry.prototype.proceedTween = function() {
		if (ST() - this.tweenStart < config.tweenTime && this.tweenMode === 'active' && !this.interrupt) {
			this.object.material.color = new THREE.Color('green');
			for (var i = 0; i < this.positions.length; i++)
				this.positions[i] = config.tweenFunction(this.oldPositions[i], this.newPositions[i], ST() - this.tweenStart);
			this.geometry.attributes.position.needsUpdate = true;
			
			setTimeout(this.proceedTween.bind(this), 25);
		} else {
			setTimeout(this.endTween.bind(this), 25);
		}
	}
	
	Geometry.prototype.endTween = function() {
		this.object.material.color = new THREE.Color('red');
		for (var i = 0; i < this.positions.length; i++)
			this.positions[i] = this.newPositions[i];
				
		this.tweenMode = 'idle';
		this.oldPositions = null;
		this.newPositions = null;
		this.tweenStart = null;
	}
	
	
}(this));