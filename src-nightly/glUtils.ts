import * as _T from '../libs/three.min';
import * as _ from 'lodash';
import { pool } from './arrayPool';
import { Panel } from './Panel';
import { config } from './config';

const Object3D = _T.Object3D;
const PointCloud = _T.PointCloud;
const Line = _T.Line;
const LinePieces = _T.LinePieces;
const BufferGeometry = _T.BufferGeometry;
const BufferAttribute = _T.BufferAttribute;

const PointCloudMaterial = _T.PointCloudMaterial;
const LineBasicMaterial = _T.LineBasicMaterial;
const MeshLambertMaterial = _T.MeshLambertMaterial;
const MeshPhongMaterial = _T.MeshPhongMaterial;
const DoubleSide = _T.DoubleSide;

export function interleave(tab, buffer, itemsize?: any) {
    itemsize = itemsize || tab.length;
    const srcLen = tab[0].length;
    resizeBuffer(buffer, itemsize * srcLen);
    const target = buffer.array;
    const existyIndices = _.range(itemsize).filter(i => !!tab[i]);

    // copy real values
    existyIndices.forEach(j => {
        const colData = tab[j].array;
        const len = tab[j].length;
        // explicit loop for perf
        // i: source index, k: target index
        for (var i = 0, k = j; i < len; i++, k += itemsize) {
            target[k] = colData[i];
        }
    });

    // fill missing values with zeros
    _.difference(_.range(itemsize), existyIndices).forEach(j => {
        // explicit loop for perf
        for (var i = 0, k = j; i < srcLen; i++, k += itemsize) {
            target[k] = 0;
        }
    });

    buffer.needsUpdate = true;
}

export function resizeBuffer(buffer, size) {
    const type = buffer.array.constructor;
    if (size !== buffer.array.length) {
        pool.push(buffer.array);
        buffer.array = pool.get(type, size);
        if (buffer.hasOwnProperty('length')) {
            buffer.length = size;
        }
    }
};

export function InstanceGL(panel, col) {
    const pointGeometry = new BufferGeometry();
    const lineGeometry = new BufferGeometry();
    const meshGeometry = new BufferGeometry();

    const position = new BufferAttribute(pool.get(Float32Array, 0), 3);
    const lineIndex = new BufferAttribute(pool.get(Uint32Array, 0), 2);
    const meshIndex = new BufferAttribute(pool.get(Uint32Array, 0), 3);

    const normal = new BufferAttribute(pool.get(Float32Array, 0), 3);
    const color = new BufferAttribute(pool.get(Float32Array, 0), 3);

    pointGeometry.addAttribute('position', position);
    lineGeometry.addAttribute('position', position);
    meshGeometry.addAttribute('position', position);
    lineGeometry.addAttribute('index', lineIndex);
    meshGeometry.addAttribute('index', meshIndex);
    meshGeometry.addAttribute('normal', normal);

    pointGeometry.addAttribute('color', color);
    lineGeometry.addAttribute('color', color);
    meshGeometry.addAttribute('color', color);

    const object = new Object3D();
    object.add(new PointCloud(pointGeometry, matHelper('point', col)))
        .add(new Line(lineGeometry, matHelper('line', col), LinePieces))
        .add(new _T.Mesh(meshGeometry, matHelper('mesh', col)));
    panel.scene.add(object);

    this.panel = panel;
    this.position = position;
    this.color = color;
    this.segments = lineIndex;
    this.faces = meshIndex;
    this.normals = normal;
    this.object = object;
};


function matHelper(type, col) {
    if (type === 'point') {
        return new PointCloudMaterial({
            size: config.particleRadius,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: false
        });
    }
    if (type === 'line') {
        return new LineBasicMaterial({
            vertexColors: _T.VertexColors
        });
    }
    if (type === 'mesh') {
        return new MeshPhongMaterial({
            side: DoubleSide,
            transparent: true,
            opacity: .7,
            vertexColors: _T.VertexColors,
            normalScale: new _T.Vector2(1, 1)
            // depthWrite: false
            // depthTest: false
        });
    }
};
