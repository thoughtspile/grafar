'use strict';

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	var config = _G.config,
		makeID = _G.makeID,
		isExisty = _G.isExisty;
	
	var panels = {},
		renderMode = (function() {
			if (Detector.webgl)
				return 'webgl';
			else if (Detector.canvas)
				return 'canvas';
			else
				return 'none';
		}()),
		Renderer = (function() {
			if (Detector.webgl)
				return function() {return new THREE.WebGLRenderer({ antialias: true })};
			else if (Detector.canvas)
				return function() {return new THREE.CanvasRenderer()};
			else
				return function() {throw new Error('no 3D support')};
		}());	
			
	function Panel(container, opts) {
		opts = opts || {};
		this.id = opts.id || makeID(panels);		
		panels[this.id] = this;
		
		var container = container || config.container,
		    containerStyle = window.getComputedStyle(container),
		    width = opts.w || Math.max(parseInt(containerStyle.width), config.minPanelWidth),
		    height = opts.h || Math.max(parseInt(containerStyle.height), config.minPanelHeight);

		this.camera = new THREE.PerspectiveCamera(45, width / height, .1, 500);
		this.camera.position.set(-4, 4, 5);
		
		this.scene = new THREE.Scene();
		
		this.renderer = (new Renderer());
		this.renderer.setSize(width, height);
		this.renderer.autoClear = false;
		this.renderer.setClearColor(0xFFFFFF, 1);
		container.appendChild(this.renderer.domElement);
		
		this.controls = new THREE.OrbitControls(this.camera, container);
		this.controls.addEventListener('change', this.render.bind(this));
		
		this.setAxes(config.axes);
		
		if (config.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		}

		this.animate();
	};
		
	Panel.prototype.animate = (function() {
		if (config.debug)
			return function() {
				window.requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.render();
				this.stats.update();
			};
		else 
			return function() {
				window.requestAnimationFrame(this.animate.bind(this));
				this.controls.update();
				this.render();
			};
	}());

	Panel.prototype.render = function() {
		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);
	};

	Panel.prototype.drawAxes = function (len) {
		if (!isExisty(this.axisObject)) {
			this.axisObject = new THREE.Object3D();		
			this.scene.add(this.axisObject);
		}
		
		while (this.axisObject.children.length)
			this.axisObject.remove(this.axisObject.children[0]);
		
		if (len) {
			this.axisObject.add(new THREE.AxisHelper(len));
			this._axes.forEach(function(axisId, i) {
				if (isExisty(axisId)) {
					var label = drawTextLabel(axisId),
						pos = [0, 0, 0];
					pos[i] = len;
					
					var geometry = new THREE.BufferGeometry();		
					geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
					this.axisObject.add(new THREE.PointCloud(geometry, label));
				}
			}.bind(this));
		};
		
		return this;
	};
		
	Panel.prototype.setAxes = function(axisNames) {
		axisNames = axisNames.filter(function(n) {return typeof(n) === 'string'}).slice(0, 3);
		
		this._axes = [axisNames[1], axisNames[2], axisNames[0]];
		if (axisNames.length === 3)
			this.setView3()
		else if (axisNames.length === 2)
			this.setView2();
		else
			throw new Error('weird number of axes specified.');
			
		this.drawAxes(1);
		
		return this;
	}
			
	Panel.prototype.setView2 = function() {
		this.controls.noRotate = true;
		this.controls.noPan = true;
		this.camera.position.set(0, 5); // preserve distance or something, maybe smooth rotation
		this.camera.up.set(1, 0, 0);
		
		return this;
	};
		
	Panel.prototype.setView3 = function() {
		this.controls.noRotate = false;
		this.controls.noPan = false;
		this.camera.up.set(0, 1, 0);
		
		return this;
	};
		
	Object.defineProperty(Panel.prototype, 'axes', {
		get: function() {
				return this._axes;
			},
		set: Panel.prototype.setAxes
	});
	
	function drawTextLabel(str) {
		var fontSizePx = 48,
			baselineOffsetPx = .15 * fontSizePx;
		var canvas = document.createElement('canvas'),
		    context = canvas.getContext('2d');
		
		context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
		
		var computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
		canvas.width = computedSize;
		canvas.height = computedSize;
		
		context = canvas.getContext('2d');
		context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
		context.fillStyle = '#444444';
		context.textAlign = 'center';
		context.fillText(str, Math.floor(computedSize / 2), Math.ceil(computedSize / 2) - baselineOffsetPx);
		
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;
		  
		var material = new THREE.PointCloudMaterial({
			size: config.labelSize / fontSizePx * computedSize,
			//sizeAttenuation: false,
			map: texture, 
			transparent: true
		});
		
		return material;
	}
		
	_G.Panel = Panel;
	_G.panels = panels;
}(this))