import * as THREE from '../libs/three.min';
import Detector from '../libs/Detector';
import * as Stats from '../libs/stats.min';
import { OrbitControls } from '../libs/OrbitControls'; // FIXME non-standard
THREE.OrbitControls = OrbitControls;

import { isExisty, makeID } from './utils';
import { pool } from './arrayPool';
import { Observable } from './Observable';
import { config } from './config';

const Renderer = THREE.WebGLRenderer.bind(null, {antialias: config.antialias});
// FIXME detect
	// renderMode = Detector.webgl? 'webgl': Detector.canvas? 'canvas': 'none',
	// Renderer = {
	// 	webgl: THREE.WebGLRenderer.bind(null, {antialias: config.antialias}),
	// 	canvas: THREE.CanvasRenderer,
	// 	none: Error.bind(null, 'no 3D support')
	// }[renderMode];

export var panels = [];

export class Panel {
	constructor(container, opts) {
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

		this.renderer = new Renderer();
		this.renderer.antialias = config.antialias;
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(bgcolor, 1);

		this.controls = new THREE.OrbitControls(this.camera, container);

		this.setAxes(config.axes);

		this.setContainer(container);

		if (config.debug) {
			this.stats = new Stats();
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			container.appendChild(this.stats.domElement);
		} else {
			this.stats = { update: () => {} };
		}
	}

	setContainer(container) {
		container.appendChild(this.renderer.domElement);
		return this;
	}

	update() {
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.stats.update();
	}

	drawAxes(len) {
		if (!isExisty(this.axisObject)) {
			this.axisObject = new THREE.Object3D();

			var axisGeometry = new THREE.BufferGeometry();
			axisGeometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 18), 3));
			this.axisObject.add(new THREE.Line(
				axisGeometry,
				new THREE.LineBasicMaterial({color: 0x888888}),
				THREE.LinePieces
			));

			for (var i = 0; i < 3; i++) {
				var geometry = new THREE.BufferGeometry();
				geometry.addAttribute('position', new THREE.BufferAttribute(axisGeometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
				this.axisObject.add(new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
					alphaTest: 0.17		// vaccarium.TODO: this is a horrible hack, see SOverflow #27042683
				})));
			}

			this.scene.add(this.axisObject);
		}

		if (isExisty(len))
			setAxisGeometry(this.axisObject.children[0].geometry.getAttribute('position').array, len);
		this._axes.forEach((axisId, i) => {
			drawTextLabel(this.axisObject.children[i + 1].material, axisId || '');
		});

		return this;
	}

	clearAxes() {
		if (isExisty(this.axisObject)) {
			this.axisObject.children.forEach(child => this.axisObject.remove(child));
			this.scene.remove(this.axisObject);
			delete this.axisObject;
		};

		return this;
	}

	setAxes(axisNames) {
		axisNames = axisNames
			.filter(n => typeof(n) === 'string')
			.slice(0, 3);

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
		// Object.getOwnPropertyNames(_G.graphs).forEach(function(graphName) {
			// var graph = _G.graphs[graphName];
			// if (graph.panel === this)
				// graph.setPanel(this);
		// }.bind(this));

		return this;
	}

	axisText(axis, distance) {
		if (isExisty(this._axes) && this._axes.includes(axis)) {
			var pos = this._axes.indexOf(axis),
				geometry = new THREE.BufferGeometry();
			geometry.addAttribute('position', new THREE.BufferAttribute(pool.get(Float32Array, 3), 3));
			geometry.getAttribute('position').array[pos] = distance;
			var textObject = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
				alphaTest: 0.17		// vaccarium.TODO: this is a horrible hack, see SOverflow #27042683
			}));
			drawTextLabel(textObject.material, distance || '');
			this.axisObject.add(textObject);
		}
		return this;
	}

	labelAxis(axis, distance) {
		return this.axisText(axis, distance);
	}
}

function setAxisGeometry(posArray, length) {
	for (var i = 0; i < 3; i++) {
		posArray[7 * i] = -length;
		posArray[7 * i + 3] = length;
	}
	return posArray;
}

function drawTextLabel(mat, str) {
	var memo = {},
		fontSizePx = 21,
		baselineOffsetPx = 0.15 * fontSizePx;

	drawTextLabel = function(mat, str) {
		if (!memo.hasOwnProperty(str)) {
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d');

			var computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
			canvas.width = computedSize;
			canvas.height = computedSize;

			context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
			context.textAlign = 'center';
			context.strokeStyle = '#dddddd';
			context.strokeText(str, Math.floor(computedSize / 2), Math.ceil(computedSize / 2) - baselineOffsetPx);
			context.fillStyle = '#444444';
			context.fillText(str, Math.floor(computedSize / 2), Math.ceil(computedSize / 2) - baselineOffsetPx);

			memo[str] = {
				size: computedSize, /*config.labelSize / fontSizePx * */
				map: new THREE.Texture(canvas)
			};
		}

		var memoEntry = memo[str];
		mat.size = memoEntry.size;
		mat.transparent = true;
		mat.sizeAttenuation = false;
		mat.map = memoEntry.map.clone();
		mat.map.needsUpdate = true;

		return mat;
	};
	return drawTextLabel(mat, str);
}
