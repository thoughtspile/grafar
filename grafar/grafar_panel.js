'use strict';

(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	var config = _G.config,
		makeID = _G.makeID,
		isExisty = _G.isExisty;
	
	var panels = {},
		renderMode = Detector.webgl? 'webgl': Detector.canvas? 'canvas': 'none',
		Renderer = {
			webgl: THREE.WebGLRenderer.bind(null, {antialias: config.antialias}),
			canvas: THREE.CanvasRenderer,
			none: Error.bind(null, 'no 3D support')
		}[renderMode];
			
	function Panel(container, opts) {
		opts = opts || {};
		this.id = opts.id || makeID(panels);		
		panels[this.id] = this;
		
		var container = container || config.container,
		    containerStyle = window.getComputedStyle(container),
		    width = Math.max(parseInt(containerStyle.width), config.minPanelWidth),
		    height = Math.max(parseInt(containerStyle.height), config.minPanelHeight);

		this.camera = new THREE.PerspectiveCamera(45, width / height, .1, 500);
		this.camera.position.set(-4, 4, 5);
		
		this.scene = new THREE.Scene();
		
		this.renderer = new Renderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(0xFFFFFF, 1);
		container.appendChild(this.renderer.domElement);
		
		this.controls = new THREE.OrbitControls(this.camera, container);
		
		this.setAxes(config.axes);
		
		if (config.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		} else {
			this.stats = {update: function() {}};
		}

		this.animate();
	};
		
	Panel.prototype.animate = function() {
		global.requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.stats.update();
	};

	Panel.prototype.drawAxes = function (len) {
		if (!isExisty(this.axisObject)) {
			this.axisObject = new THREE.Object3D();
						
			var axisGeometry = new THREE.BufferGeometry();
			axisGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
			this.axisObject.add(new THREE.Line(
				axisGeometry, 
				new THREE.LineBasicMaterial({color: 0x888888}), 
				THREE.LinePieces
			));
			
			for (var i = 0; i < 3; i++) {
				var geometry = new THREE.BufferGeometry();
				geometry.addAttribute('position', new THREE.BufferAttribute(axisGeometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
				this.axisObject.add(new THREE.PointCloud(geometry, new THREE.PointCloudMaterial()));
			}
			
			this.scene.add(this.axisObject);
		}		
		
		if (isExisty(len))
			setAxisGeometry(this.axisObject.children[0].geometry.getAttribute('position').array, len);
		this._axes.forEach(function(axisId, i) {
			drawTextLabel(this.axisObject.children[i + 1].material, axisId || '');
		}.bind(this));
		
		return this;
	};
		
	Panel.prototype.setAxes = function(axisNames) {
		axisNames = axisNames.filter(function(n) {return typeof(n) === 'string'}).slice(0, 3);
		
		this._axes = [axisNames[1], axisNames[2], axisNames[0]];
		if (axisNames.length === 3) {
			this.controls.noRotate = false;
			this.controls.noPan = false;
			this.camera.up.set(0, 1, 0);
		} else if (axisNames.length === 2) {
			this.controls.noRotate = true;
			this.controls.noPan = true;
			this.camera.position.set(0, 5); // preserve distance or something, maybe smooth rotation
			this.camera.up.set(1, 0, 0);
		} else {
			// 1 or >3 axes leads to what?
		}
			
		this.drawAxes(2);
		
		return this;
	};
		
	
	function setAxisGeometry(posArray, length) {
		for (var i = 0; i < 3; i++) {
			posArray[7 * i] = -length;
			posArray[7 * i + 3] = length;
		}
		return posArray;
	}
	
	function drawTextLabel(mat, str) {
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
		  
		mat.size = config.labelSize / fontSizePx * computedSize;
		mat.map = texture;
		mat.transparent = true;
		
		return mat;
	}
		
	
	_G.Panel = Panel;
	_G.panels = panels;
}(this))