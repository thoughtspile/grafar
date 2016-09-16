"use strict";
var THREE = require('../libs/three.min');
var Stats = require('stats');
var OrbitControls_1 = require('../libs/OrbitControls');
THREE.OrbitControls = OrbitControls_1.OrbitControls;
var utils_1 = require('./utils');
var arrayPool_1 = require('./arrayPool');
var config_1 = require('./config');
var Renderer = THREE.WebGLRenderer.bind(null, { antialias: config_1.config.antialias });
exports.panels = [];
var Panel = (function () {
    function Panel(container, opts) {
        opts = opts || {};
        exports.panels.push(this);
        container = container || config_1.config.container;
        var containerStyle = window.getComputedStyle(container);
        var bgcolor = containerStyle.backgroundColor;
        var width = parseInt(containerStyle.width);
        var height = parseInt(containerStyle.height);
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        this.camera.position.set(-4, 4, 5);
        this.scene = new THREE.Scene();
        var pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.set(0, 5, 7);
        this.scene.add(pointLight);
        this.renderer = new Renderer();
        this.renderer.antialias = config_1.config.antialias;
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(bgcolor, 1);
        this.controls = new THREE.OrbitControls(this.camera, container);
        this.setAxes(config_1.config.axes);
        this.setContainer(container);
        if (config_1.config.debug) {
            this.stats = new Stats();
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.top = '0px';
            container.appendChild(this.stats.domElement);
        }
        else {
            this.stats = { update: function () { } };
        }
    }
    Panel.prototype.setContainer = function (container) {
        container.appendChild(this.renderer.domElement);
        return this;
    };
    Panel.prototype.update = function () {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    };
    Panel.prototype.drawAxes = function (len) {
        var _this = this;
        if (!utils_1.isExisty(this.axisObject)) {
            this.axisObject = new THREE.Object3D();
            var axisGeometry = new THREE.BufferGeometry();
            axisGeometry.addAttribute('position', new THREE.BufferAttribute(arrayPool_1.pool.get(Float32Array, 18), 3));
            this.axisObject.add(new THREE.Line(axisGeometry, new THREE.LineBasicMaterial({ color: 0x888888 }), THREE.LinePieces));
            for (var i = 0; i < 3; i++) {
                var geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.BufferAttribute(axisGeometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
                this.axisObject.add(new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
                    alphaTest: 0.17
                })));
            }
            this.scene.add(this.axisObject);
        }
        if (utils_1.isExisty(len)) {
            setAxisGeometry(this.axisObject.children[0].geometry.getAttribute('position').array, len);
        }
        this._axes.forEach(function (axisId, i) {
            drawTextLabel(_this.axisObject.children[i + 1].material, axisId || '');
        });
        return this;
    };
    Panel.prototype.clearAxes = function () {
        var _this = this;
        if (utils_1.isExisty(this.axisObject)) {
            this.axisObject.children.forEach(function (child) { return _this.axisObject.remove(child); });
            this.scene.remove(this.axisObject);
            delete this.axisObject;
        }
        ;
        return this;
    };
    Panel.prototype.setAxes = function (axisNames) {
        axisNames = axisNames
            .filter(function (n) { return typeof (n) === 'string'; })
            .slice(0, 3);
        this._axes = [axisNames[1], axisNames[2], axisNames[0]];
        if (axisNames.length === 3) {
            this.controls.noRotate = false;
            this.controls.noPan = false;
            this.camera.up.set(0, 1, 0);
        }
        else if (axisNames.length === 2) {
            this.controls.noRotate = true;
            this.controls.noPan = true;
            this.camera.position.set(0, 5);
            this.camera.up.set(1, 0, 0);
        }
        else {
        }
        this.drawAxes(2);
        return this;
    };
    Panel.prototype.axisText = function (axis, distance) {
        if (utils_1.isExisty(this._axes) && this._axes.includes(axis)) {
            var pos = this._axes.indexOf(axis);
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(arrayPool_1.pool.get(Float32Array, 3), 3));
            geometry.getAttribute('position').array[pos] = distance;
            var textObject = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
                alphaTest: 0.17
            }));
            drawTextLabel(textObject.material, distance || '');
            this.axisObject.add(textObject);
        }
        return this;
    };
    Panel.prototype.labelAxis = function (axis, distance) {
        return this.axisText(axis, distance);
    };
    return Panel;
}());
exports.Panel = Panel;
function setAxisGeometry(posArray, length) {
    for (var i = 0; i < 3; i++) {
        posArray[7 * i] = -length;
        posArray[7 * i + 3] = length;
    }
    return posArray;
}
var drawTextLabel = function (mat, str) {
    var memo = {};
    var fontSizePx = 21;
    var baselineOffsetPx = 0.15 * fontSizePx;
    drawTextLabel = function (mat, str) {
        if (!memo.hasOwnProperty(str)) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
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
                size: computedSize,
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
};
