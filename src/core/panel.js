'use strict';

(function(global) {
	var _G = global.grafar;
	var config = _G.config;
	var isExisty = _G.isExisty;

	var THREE = global.THREE;
	var Detector = global.Detector;
	var Stats = global.Stats;

	var panels = _G.panels;
	var Renderer = (function() {
		if (Detector.webgl)
			return THREE.WebGLRenderer.bind(null, {antialias: config.antialias});
		if (Detector.canvas)
			return THREE.CanvasRenderer;
		return Error.bind(null, 'no 3D support')
	}());


	function Panel(container, opts) {
		opts = opts || {};
		panels.push(this);

		container = container || config.container;
		var containerStyle = window.getComputedStyle(container),
			bgcolor = containerStyle.backgroundColor,
		    width = parseInt(containerStyle.width),
		    height = parseInt(containerStyle.height);

		this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
		this.camera.position.set(-4, 4, 5);

		this.scene = new THREE.Scene();
		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.set( 0, 5, 7 );
		this.scene.add( pointLight );
		pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.set( 0, -5, -7 );
		this.scene.add( pointLight );

		this.renderer = new Renderer();
		this.renderer.antialias = config.antialias;
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(bgcolor, 1);

		this.controls = new THREE.OrbitControls(this.camera, container);

		this.setAxes(config.axes);

		container.appendChild(this.renderer.domElement);

		if (config.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		} else {
			this.stats = {update: function() {}};
		}
	};

	function panelWrapper(container, opts) {
		if (typeof container === 'string')
			container = document.getElementById(container);
		return new Panel(container, opts);
	}


	Panel.prototype.update = function() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.stats.update();
	};

	Panel.prototype.setAxes = function(axisNames) {
		this._axes = [axisNames[1], axisNames[2], axisNames[0]].filter(isExisty);
		if (axisNames.length === 3) {
			this.controls.noRotate = false;
			this.camera.up.set(0, 1, 0);
		} else if (axisNames.length === 2) {
			this.controls.noRotate = true;
			this.camera.position.set(0, 0, -5);
			this.camera.up.set(1, 0, 0);
		} else {
            throw new Error('wrong amount of axes specified');
		}

		return this;
	};


	_G.Panel = Panel;
	_G.panel = panelWrapper;
}(this));
