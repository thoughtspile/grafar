
var config = require('../config.js');
var isExisty = require('./misc.js').isExisty;

var THREE = require('three');
var Detector = require('detector');
var Stats = require('stats');

var panels = config.panels;
var Renderer = (function() {
	if (Detector.webgl)
		return THREE.WebGLRenderer.bind(null, {antialias: config.antialias});
	if (Detector.canvas)
		return THREE.CanvasRenderer;
	return Error.bind(null, 'no 3D support')
}());


function Panel(container) {
	container = container || config.container;
	var containerStyle = window.getComputedStyle(container);
	var bgcolor = containerStyle.backgroundColor;
	var width = parseInt(containerStyle.width);
	var height = parseInt(containerStyle.height);

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

	this.dim(3);

	if (config.debug) {
		this.stats = new Stats();
		this.stats.domElement.style.position = 'fixed';
		container.appendChild(this.stats.domElement);
	} else {
		this.stats = {update: function() {}};
	}

	container.appendChild(this.renderer.domElement);
	panels.push(this);
};

function panelFactory(container, opts) {
	if (typeof container === 'string')
		container = document.getElementById(container);
	return new Panel(container, opts);
}


Panel.prototype.update = function() {
	this.controls.update();
	this.renderer.render(this.scene, this.camera);
	this.stats.update();
};

Panel.prototype.dim = function(nDim) {
	if (nDim === 3) {
		this.controls.noRotate = false;
		this.camera.up.set(0, 1, 0);
	} else if (nDim === 2) {
		// pan with LMB
		this.controls.noRotate = true;
		this.camera.position.set(0, 0, -5);
		this.camera.up.set(1, 0, 0);
	} else {
        throw new Error('wrong amount of axes specified');
	}

	return this;
};


module.exports = {
	Panel: Panel,
	panel: panelFactory
};
