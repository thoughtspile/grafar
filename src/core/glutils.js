'use strict';
	
(function(global) {
	var _G = global.grafar,
		pool = _G.pool,
        isExisty = _G.isExisty,
        Panel = _G.Panel,
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
                size: config.particleRadius, 
                transparent: true, 
                opacity: 0.5, 
                sizeAttenuation: false
            });
        else if (type === 'line')
            mat = new LineBasicMaterial({
            });            
        else if (type === 'mesh')
            mat = new MeshLambertMaterial({
                side: DoubleSide,
                transparent: true,
                opacity: .5,
                depthWrite: false
                //depthTest: false
            });
        mat.color = col;
        return mat;
    };
    
    function interleave(tab, buffer) {
        var itemsize = tab.length;
        resizeBuffer(buffer, itemsize * tab[0].validate().length);
        var target = buffer.array;
		for (var j = 0; j < itemsize; j++) {
            var colData = tab[j].value(),
                len = tab[j].length;
            for (var i = 0, k = j; i < len; i++, k += itemsize)
                target[k] = colData[i];
		}
        buffer.needsUpdate = true;
    }
                
    function resizeBuffer(buffer, size) {
        var type = buffer.array.constructor;
        if (size !== buffer.array.length) {
            pool.push(buffer.array);
            buffer.array = pool.get(type, size);
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
    
    
	_G.InstanceGL = InstanceGL;
	_G.interleave = interleave;
	_G.resizeBuffer = resizeBuffer;
}(this));