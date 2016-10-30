import * as THREE from 'three';
import Detector from '../../libs/Detector';
import * as Stats from 'stats.js';
import * as OrbitControls from '../../libs/OrbitControls';

import { isExisty, makeID } from '../utils';
import { Pool } from '../array/Pool';
import { config } from '../config';

const Renderer = THREE.WebGLRenderer.bind(null, {antialias: config.antialias});
// FIXME detect
    // renderMode = Detector.webgl? 'webgl': Detector.canvas? 'canvas': 'none',
    // Renderer = {
    //     webgl: THREE.WebGLRenderer.bind(null, {antialias: config.antialias}),
    //     canvas: THREE.CanvasRenderer,
    //     none: Error.bind(null, 'no 3D support')
    // }[renderMode];

export const panels = [];

export class Panel {
    constructor(container, opts) {
        opts = opts || {};
        panels.push(this);

        container = container || config.container;
        const containerStyle = window.getComputedStyle(container);
        const bgcolor = containerStyle.backgroundColor === 'transparent'
            ? 'white'
            : containerStyle.backgroundColor;
        const width = parseInt(containerStyle.width);
        const height = parseInt(containerStyle.height);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        this.camera.position.set(-4, 4, 5);

        this.scene = new THREE.Scene();
        const pointLight = new THREE.PointLight(0xFFFFFF);
        pointLight.position.set( 0, 5, 7 );
        this.scene.add( pointLight );

        this.renderer = new Renderer();
        this.renderer.antialias = config.antialias;
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(bgcolor, 1);

        this.controls = new OrbitControls(this.camera, container);

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

    camera;
    stats;
    controls;
    renderer;
    scene;
    axisObject;
    _axes;

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
            this.axisObject = new THREE.Group();

            const axisGeometry = new THREE.BufferGeometry();
            axisGeometry.addAttribute('position', new THREE.BufferAttribute(Pool.get(Float32Array, 18), 3));
            this.axisObject.add(new THREE.LineSegments(
                axisGeometry,
                new THREE.LineBasicMaterial({color: 0x888888})
            ));

            for (var i = 0; i < 3; i++) {
                const geometry = new THREE.BufferGeometry();
                geometry.addAttribute('position', new THREE.BufferAttribute(axisGeometry.getAttribute('position').array.subarray(i * 6 + 3, i * 6 + 6), 3));
                this.axisObject.add(new THREE.Points(geometry, new THREE.PointsMaterial({
                    alphaTest: 0.17        // vaccarium.TODO: this is a horrible hack, see SOverflow #27042683
                })));
            }

            this.scene.add(this.axisObject);
        }

        if (isExisty(len)) {
            setAxisGeometry(this.axisObject.children[0].geometry.getAttribute('position').array, len);
        }

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

        return this;
    }

    axisText(axis, distance) {
        if (isExisty(this._axes) && this._axes.indexOf(axis) > -1) {
            const pos = this._axes.indexOf(axis);

            const geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(Pool.get(Float32Array, 3), 3));
            geometry.getAttribute('position').array[pos] = distance;

            const textObject = new THREE.Points(geometry, new THREE.PointsMaterial({
                alphaTest: 0.17        // vaccarium.TODO: this is a horrible hack, see SOverflow #27042683
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

let drawTextLabel = function (mat, str) {
    const memo = {};
    const fontSizePx = 21;
    const baselineOffsetPx = 0.15 * fontSizePx;

    drawTextLabel = function(mat, str) {
        if (!memo.hasOwnProperty(str)) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
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

        const memoEntry = memo[str];
        mat.size = memoEntry.size;
        mat.transparent = true;
        mat.sizeAttenuation = false;
        mat.map = memoEntry.map.clone();
        mat.map.needsUpdate = true;

        return mat;
    };
    return drawTextLabel(mat, str);
}
