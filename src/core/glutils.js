'use strict';

(function(global) {
	var _G = global.grafar,
		pool = _G.pool,
		isExisty = _G.isExisty,
        config = _G.config,

		_T = global.THREE,
		Object3D = _T.Object3D,
		PointCloud = _T.PointCloud,
		Line = _T.Line,
		LinePieces = _T.LinePieces,
		BufferGeometry = _T.BufferGeometry,
		BufferAttribute = _T.BufferAttribute,

        PointCloudMaterial = _T.PointCloudMaterial,
        LineBasicMaterial = _T.LineBasicMaterial,
        MeshLambertMaterial = _T.MeshLambertMaterial,
        DoubleSide = _T.DoubleSide;


    function matHelper(type, col) {
        var mat = null;
        if (type === 'point')
            mat = new PointCloudMaterial({
                size: 5,
                transparent: true,
                opacity: 0.5,
                sizeAttenuation: false
            });
        else if (type === 'line')
            mat = new LineBasicMaterial({
            });
        else if (type === 'mesh')
            mat = new THREE.MeshPhongMaterial({
                side: DoubleSide,
                transparent: true,
                opacity: .7
                //depthWrite: false
                //depthTest: false
            });
        mat.color = col;
        return mat;
    };

    function interleave(tab, buffer, itemsize) {
        itemsize = itemsize || tab.length;
        resizeBuffer(buffer, itemsize * tab[0].length);
        var target = buffer.array;
		for (var j = 0; j < tab.length; j++) {
            var colData = tab[j].array,
                len = tab[j].length;
            for (var i = 0, k = j; i < len; i++, k += itemsize)
                target[k] = colData[i];
		}
        for (var j = tab.length; j < itemsize; j++) {
            for (var i = 0, k = j; i < len; i++, k += itemsize)
                target[k] = 0;
		}
        buffer.needsUpdate = true;
    }

    function resizeBuffer(buffer, size) {
        var type = buffer.array.constructor;
        if (size !== buffer.array.length) {
            pool.push(buffer.array);
            buffer.array = pool.get(type, size);
            if (buffer.hasOwnProperty('length'))
                buffer.length = size;
        }
    };

    function InstanceGL(panel, col) {
        var pointGeometry = new BufferGeometry(),
			lineGeometry = new BufferGeometry(),
			meshGeometry = new BufferGeometry(),
			position = new BufferAttribute(pool.get(Float32Array, 0), 3),
			lineIndex = new BufferAttribute(pool.get(Uint32Array, 0), 2),
			meshIndex = new BufferAttribute(pool.get(Uint32Array, 0), 3),
			normal = new BufferAttribute(pool.get(Float32Array, 0), 3);

		pointGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('position', position);
		meshGeometry.addAttribute('position', position);
		lineGeometry.addAttribute('index', lineIndex);
		meshGeometry.addAttribute('index', meshIndex);
		meshGeometry.addAttribute('normal', normal);

		var object = new Object3D();
        object.add(new PointCloud(pointGeometry, matHelper('point', col)))
            .add(new Line(lineGeometry, matHelper('line', col), LinePieces))
            .add(new THREE.Mesh(meshGeometry, matHelper('mesh', col)));
		panel.scene.add(object);

        this.panel = panel;
        this.position = position;
        this.segments = lineIndex;
        this.faces = meshIndex;
        this.normals = normal;
        this.object = object;
    };

	function textSprite(str, col) {
		var fontSizePx = 21,
			baselineOffsetPx = 0.15 * fontSizePx;

		var canvas = document.createElement('canvas'),
			context = canvas.getContext('2d');

		context.font = 'Lighter ' + fontSizePx + 'px Helvetica';

		var computedSize = Math.ceil(Math.max(2 * (fontSizePx + baselineOffsetPx), context.measureText(str).width));
		canvas.width = computedSize;
		canvas.height = computedSize;

		context.font = 'Lighter ' + fontSizePx + 'px Helvetica';
		context.fillStyle = isExisty(col)? col: '#444444';
		context.textAlign = 'center';
		context.fillText(str, Math.floor(computedSize / 2), Math.ceil(computedSize / 2) - baselineOffsetPx);

		var mat = new THREE.PointCloudMaterial({
            size: computedSize, //config.labelSize / fontSizePx
            transparent: true,
            sizeAttenuation: false,
            map: new THREE.Texture(canvas)
        });
        mat.map.needsUpdate = true;
        return mat;
	}

    function circleSprite(col) {
        var canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            size = 5;

        canvas.width = 2 * size;
        canvas.height = 2 * size;

        context.beginPath();
        context.arc(size, size, size, 0, 2 * Math.PI, false);
        context.fillStyle = col || 'orange';
        context.fill();

        var mat = new THREE.PointCloudMaterial({
            size: size,
            transparent: true,
            sizeAttenuation: false,
            map: new THREE.Texture(canvas)
        });
        mat.map.needsUpdate = true;
        return mat;
    }


	_G.InstanceGL = InstanceGL;
	_G.interleave = interleave;
	_G.resizeBuffer = resizeBuffer;
    _G.circleSprite = circleSprite;
	_G.textSprite = textSprite;
}(this));
