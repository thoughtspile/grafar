'use strict';

(function(global) {
	var _G = global.grafar;
	var config = _G.config;
	var isExisty = _G.isExisty;
    var Panel = _G.Panel;

	var THREE = global.THREE;


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

	function drawTextLabel(mat, str) {
		var memo = {},
			fontSizePx = 21,
			baselineOffsetPx = 0.15 * fontSizePx;

		drawTextLabel = function(mat, str) {
			if (!memo.hasOwnProperty(str)) {
				var canvas = document.createElement('canvas'),
					context = canvas.getContext('2d');

				context.font = 'Lighter ' + fontSizePx + 'px Helvetica';

				var computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
				canvas.width = computedSize;
				canvas.height = computedSize;

				context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
				context.fillStyle = '#444444';
				context.textAlign = 'center';
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
}(this));
