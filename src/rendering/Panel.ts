import * as THREE from 'three';
import Detector from '../../libs/Detector';
import * as Stats from 'stats.js';
import * as OrbitControls from '../../libs/OrbitControls';

import { isExisty, makeID } from '../utils';
import { Pool } from '../array/Pool';
import { config } from '../config';

// Type declaration for ResizeObserver
declare const ResizeObserver: {
    new(callback: (entries: ResizeObserverEntry[]) => void): ResizeObserver;
    prototype: ResizeObserver;
};

interface ResizeObserver {
    observe(target: Element): void;
    unobserve(target: Element): void;
    disconnect(): void;
}

interface ResizeObserverEntry {
    target: Element;
    contentRect: DOMRectReadOnly;
}

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
        try {
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


            // Store container reference for resize handling
            this.container = container;
            this.bgcolor = bgcolor;

            this.setContainer(container);
            
            // Create controls after canvasWrapper is created
            try {
                this.controls = new OrbitControls(this.camera, this.canvasWrapper);
            } catch (error) {
                console.error('Failed to create OrbitControls with canvasWrapper:', error);
                // Fallback: create controls with the container if canvasWrapper fails
                this.controls = new OrbitControls(this.camera, container);
            }

            // Set axes after controls are created
            this.setAxes(config.axes);

            // Set up resize handling
            this.setupResizeHandler();

            if (config.debug) {
                this.stats = new Stats();
                this.stats.domElement.style.position = 'absolute';
                this.stats.domElement.style.top = '0px';
                container.appendChild(this.stats.domElement);
            } else {
                this.stats = { update: () => {} };
            }

        } catch (error) {
            console.error('Failed to create Panel:', error);
            throw error;
        }
    }

    camera;
    stats;
    controls;
    renderer;
    scene;
    axisObject;
    _axes;
    container;
    canvasWrapper;
    bgcolor;
    resizeHandler;
    resizeObserver;
    sizePollingInterval;
    isResizing;
    resizeStartHandler;
    resizeEndHandler;

    setContainer(container) {
        // Create a wrapper div for the canvas to isolate it from resize handle
        this.canvasWrapper = document.createElement('div');
        this.canvasWrapper.style.width = '100%';
        this.canvasWrapper.style.height = '100%';
        this.canvasWrapper.style.position = 'relative';
        this.canvasWrapper.style.overflow = 'hidden';
        
        // Add the canvas to the wrapper
        this.canvasWrapper.appendChild(this.renderer.domElement);
        
        // Add the wrapper to the container
        container.appendChild(this.canvasWrapper);
        
        
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
                geometry.addAttribute('position', new THREE.BufferAttribute((axisGeometry.getAttribute('position').array as Float32Array).subarray(i * 6 + 3, i * 6 + 6), 3));
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
            (geometry.getAttribute('position').array[pos] as Float32Array) = distance;

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

    setupResizeHandler() {
        // Create a debounced resize handler that waits for resize to complete
        this.resizeHandler = this.debounce(() => {
            this.handleResize();
        }, 1); // Wait 1ms after resize stops

        // Add window resize event listener
        window.addEventListener('resize', this.resizeHandler);
        
        // Use ResizeObserver for container size changes (more reliable than window resize)
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    if (entry.target === this.container) {
                        // Debounce container resize updates
                        this.resizeHandler();
                    }
                }
            });
            this.resizeObserver.observe(this.container);
        } else {
            // Fallback for older browsers - poll container size
            this.startSizePolling();
        }
        
        // Handle resize handle interactions to prevent conflicts with OrbitControls
        this.setupResizeHandleHandling();
    }

    handleResize() {
        if (!this.container) return;

        const containerStyle = window.getComputedStyle(this.container);
        const newWidth = parseInt(containerStyle.width);
        const newHeight = parseInt(containerStyle.height);

        // Only resize if dimensions actually changed and are valid
        if (newWidth > 0 && newHeight > 0 && 
            (newWidth !== this.renderer.getSize().width || newHeight !== this.renderer.getSize().height)) {
            
            
            // Store current camera position and target to maintain view
            const currentPosition = this.camera.position.clone();
            const currentTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3();
            
            // Update camera aspect ratio
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();

            // Update renderer size - let Three.js handle the WebGL context properly
            this.renderer.setSize(newWidth, newHeight);

            // Update controls if they exist
            if (this.controls) {
                this.controls.handleResize();
                // Restore camera position and target to maintain view
                this.camera.position.copy(currentPosition);
                this.controls.target.copy(currentTarget);
                this.controls.update();
            }
            
        }
    }

    startSizePolling() {
        // Fallback for browsers without ResizeObserver
        let lastWidth = 0;
        let lastHeight = 0;
        
        this.sizePollingInterval = setInterval(() => {
            if (!this.container) return;
            
            const containerStyle = window.getComputedStyle(this.container);
            const currentWidth = parseInt(containerStyle.width);
            const currentHeight = parseInt(containerStyle.height);
            
            if (currentWidth !== lastWidth || currentHeight !== lastHeight) {
                lastWidth = currentWidth;
                lastHeight = currentHeight;
                this.handleResize();
            }
        }, 100);
    }

    setupResizeHandleHandling() {
        if (!this.container || !this.controls) return;
        
        // Detect when user starts resizing by dragging the resize handle
        this.resizeStartHandler = (event) => {
            // Check if the mouse is near the bottom-right corner (resize handle area)
            const rect = this.container.getBoundingClientRect();
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            // Define resize handle area (bottom-right 20x20 pixels)
            const handleSize = 20;
            const isInResizeHandle = 
                mouseX >= rect.right - handleSize && 
                mouseY >= rect.bottom - handleSize;
            
            if (isInResizeHandle) {
                this.isResizing = true;
                // Disable OrbitControls during resize
                this.controls.enabled = false;
                // Add visual feedback
                this.container.style.cursor = 'nw-resize';
                // Prevent the event from reaching OrbitControls
                event.stopPropagation();
            }
        };
        
        this.resizeEndHandler = () => {
            if (this.isResizing) {
                this.isResizing = false;
                // Re-enable OrbitControls
                this.controls.enabled = true;
                // Reset cursor
                this.container.style.cursor = '';
                
                // Immediately update the graph when user stops dragging
                setTimeout(() => {
                    this.handleResize();
                }, 1); // Small delay to ensure resize is complete
            }
        };
        
        // Add event listeners to the container (not the canvasWrapper)
        // This way we can detect resize handle interactions without interfering with OrbitControls
        this.container.addEventListener('mousedown', this.resizeStartHandler, true); // Use capture phase
        document.addEventListener('mouseup', this.resizeEndHandler);
        document.addEventListener('mouseleave', this.resizeEndHandler);
        
        // Also handle touch events for mobile
        this.container.addEventListener('touchstart', this.resizeStartHandler, true);
        document.addEventListener('touchend', this.resizeEndHandler);
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function() {
            const args = arguments;
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    destroy() {
        // Clean up resize event listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Clean up ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Clean up polling interval
        if (this.sizePollingInterval) {
            clearInterval(this.sizePollingInterval);
        }
        
        // Clean up resize handle event listeners
        if (this.container && this.resizeStartHandler) {
            this.container.removeEventListener('mousedown', this.resizeStartHandler);
            this.container.removeEventListener('touchstart', this.resizeStartHandler);
        }
        if (this.resizeEndHandler) {
            document.removeEventListener('mouseup', this.resizeEndHandler);
            document.removeEventListener('mouseleave', this.resizeEndHandler);
            document.removeEventListener('touchend', this.resizeEndHandler);
        }
        
        // Remove from panels array
        const index = panels.indexOf(this);
        if (index > -1) {
            panels.splice(index, 1);
        }
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
