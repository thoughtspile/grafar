var misc = require('./misc.js');
var isExisty = misc.isExisty;

var config = require('../config.js');

var Panel = requre('./panel.js').Panel;
var textSprite = requre('./panel.js').textSprite;

var THREE = require('three');


Panel.prototype.drawAxes = function (len) {
	if (!isExisty(this.axisObject)) {
		var axisGeometry = new THREE.BufferGeometry();
		axisGeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
		this.axisObject = new THREE.Line(
			axisGeometry,
			new THREE.LineBasicMaterial({color: 0x888888}),
			THREE.LinePieces
		);
		this.scene.add(this.axisObject);
	}
	setAxisGeometry(this.axisObject.geometry.getAttribute('position').array, len, this._axes.length);

    if (!isExisty(this.axisLabels)) {
		this.axisLabels = new THREE.Object3D();
		for (var i = 0; i < 3; i++) {
			var labelPos = new THREE.BufferGeometry();
			labelPos.addAttribute('position', new THREE.BufferAttribute(this.axisObject.geometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
			this.axisLabels.add(new THREE.PointCloud(labelPos, new THREE.PointCloudMaterial()));
		}
        this.scene.add(this.axisLabels);
    }
    this.axisLabels.children.forEach(function(child, i) {
		drawTextLabel(child.material, this._axes[i] || '');
	}.bind(this));

	return this;
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
	this.drawAxes(2);

	return this;
};


function setAxisGeometry(posArray, length, dim) {
    dim = dim || 3;
	for (var i = 0; i < 3; i++) {
        var len = i < dim? length: 0;
		posArray[7 * i] = -len;
		posArray[7 * i + 3] = len;
	}
	return posArray;
}
