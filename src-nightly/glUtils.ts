import * as _T from '../libs/three.min';
import * as _ from 'lodash';
import { Pool } from './array/Pool';
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

/*
 * Переложить элементы из нескольких Buffer в один Three.Buffer:
 *   например, из [x1,x2], [y1,y2], [z1,z2] получится [x1,y1,z1,  x2,y2,z2]
 * @param itemsize -- размерность, чтобы можно было сложить два массива в трехмерный общий.
 *   например, если itemsize === 3, из [x1,x2], [y1,y2] получится [x1,y1,0,  x2,y2,0]
 *   более того, можно передать tab = [x_buff, null, z_buff], получится [x1,0,z1,  x2,0,z2]
 */
export function interleave(tab: { array: Float32Array; length: number }[], buffer: { array: Float32Array; length: number; needsUpdate: boolean }, itemsize?: number) {
    itemsize = itemsize || tab.length;
    const srcLen = tab[0].length;
    resizeBuffer(buffer, itemsize * srcLen);
    const target = buffer.array;
    const existyIndices = _.range(itemsize).filter(i => !!tab[i]);

    // Скопировать настоящие значения из tab
    existyIndices.forEach(j => {
        const colData = tab[j].array;
        const len = tab[j].length;
        for (var i = 0, k = j; i < len; i++, k += itemsize) {
            target[k] = colData[i];
        }
    });

    // Заполнить остальные нулями
    _.difference(_.range(itemsize), existyIndices).forEach(j => {
        for (var i = 0, k = j; i < srcLen; i++, k += itemsize) {
            target[k] = 0;
        }
    });

    buffer.needsUpdate = true;
}

/*
 * Изменить размер буфера (работает для Three.Buffer и Buffer)
 * Старый массив сдается в Pool, новый берется оттуда же.
 * Если размер не изменился, ничего не произойдет.
 */
export function resizeBuffer(buffer: { array: Float32Array; length: number }, size) {
    const type: any = buffer.array.constructor;
    // TODO: Pool сам разрулит такой случай: сдал массив, получил его же.
    if (size !== buffer.array.length) {
        Pool.push(buffer.array);
        buffer.array = <any>Pool.get(type, size);
        if (buffer.hasOwnProperty('length')) {
            buffer.length = size;
        }
    }
};

/*
 * Обертка для Three-штучек:
 *   слой спрайтов, слой линий, слой граней.
 *   также нормали и цвета.
 *   все собирается в Three.Object3D
 * добавить на Panel (в <Panel>.scene: THREE.Scene)
 */
export class InstanceGL {
    constructor(public panel, col) {
        this.linkAttributes();
        this.linkColor();

        this.object.add(new PointCloud(this.pointGeometry, matHelper('point', col)))
            .add(new Line(this.lineGeometry, matHelper('line', col), LinePieces))
            .add(new _T.Mesh(this.meshGeometry, matHelper('mesh', col)));
        panel.scene.add(this.object);
    }

    linkAttributes() {
        this.pointGeometry.addAttribute('position', this.position);
        this.lineGeometry.addAttribute('position', this.position);
        this.meshGeometry.addAttribute('position', this.position);
        this.lineGeometry.addAttribute('index', this.segments);
        this.meshGeometry.addAttribute('index', this.faces);
        this.meshGeometry.addAttribute('normal', this.normals);
    }

    linkColor() {
        this.pointGeometry.addAttribute('color', this.color);
        this.lineGeometry.addAttribute('color', this.color);
        this.meshGeometry.addAttribute('color', this.color);
    }

    pointGeometry = new BufferGeometry();
    lineGeometry = new BufferGeometry();
    meshGeometry = new BufferGeometry();

    position = new BufferAttribute(Pool.get(Float32Array, 0), 3);
    segments = new BufferAttribute(Pool.get(Uint32Array, 0), 2);
    faces = new BufferAttribute(Pool.get(Uint32Array, 0), 3);

    normals = new BufferAttribute(Pool.get(Float32Array, 0), 3);
    color = new BufferAttribute(Pool.get(Float32Array, 0), 3);

    object = new Object3D();
}

/*
 * Фабрика THREE-материалов.
 */
function matHelper(type: 'point' | 'line' | 'mesh', col) {
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
