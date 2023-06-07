import * as THREE from 'three';
import range from 'lodash/range';
import difference from 'lodash/difference';

import { Pool } from '../array/Pool';
import { Buffer, BufferLike } from '../array/Buffer';
import { Panel } from './Panel';
import { config } from '../config';

/**
 * Переложить элементы из нескольких Buffer в один Three.Buffer:
 *   например, из [x1,x2], [y1,y2], [z1,z2] получится [x1,y1,z1,  x2,y2,z2]
 * @param itemsize -- размерность, чтобы можно было сложить два массива в трехмерный общий.
 *   например, если itemsize === 3, из [x1,x2], [y1,y2] получится [x1,y1,0,  x2,y2,0]
 *   более того, можно передать tab = [x_buff, null, z_buff], получится [x1,0,z1,  x2,0,z2]
 */
export function interleave(tab: BufferLike[], buffer: THREE.BufferAttribute, itemsize?: number) {
    itemsize = itemsize || tab.length;

    if (itemsize !== buffer.itemSize) {
        throw new Error(`Cannot interleave ${ itemsize } buffers into attribute with itemSize ${ buffer.itemSize }`);
    }

    const srcLen = tab[0].count;
    Buffer.resize(buffer, srcLen);
    const target = <Float32Array>buffer.array;
    const existyIndices = range(itemsize).filter(i => !!tab[i]);

    /** Скопировать настоящие значения из tab */
    existyIndices.forEach(j => {
        const colData = tab[j].array;
        const len = tab[j].count;
        for (var i = 0, k = j; i < len; i++, k += itemsize) {
            target[k] = colData[i];
        }
    });

    /** Заполнить остальные нулями */
    difference(range(itemsize), existyIndices).forEach(j => {
        for (var i = 0, k = j; i < srcLen; i++, k += itemsize) {
            target[k] = 0;
        }
    });

    buffer.needsUpdate = true;
}

/**
 * Обертка для Three-штучек:
 *   слой спрайтов, слой линий, слой граней.
 *   также нормали и цвета.
 *   все собирается в THREE.Group
 * добавить на Panel (в <Panel>.scene: THREE.Scene)
 */
export class InstanceGL {
    constructor(public panel: Panel) {
        this.linkPosition();
        this.linkIndex();
        this.linkColor();

        this.object.add(new THREE.Points(this.pointGeometry, matHelper.point()));
        this.object.add(new THREE.LineSegments(this.lineGeometry, matHelper.line()));
        this.object.add(new THREE.Mesh(this.meshGeometry, matHelper.mesh()));

        panel.scene.add(this.object);
    }

    private linkPosition() {
        this.pointGeometry.addAttribute('position', this.position);
        this.lineGeometry.addAttribute('position', this.position);
        this.meshGeometry.addAttribute('position', this.position);
    }

    private linkColor() {
        this.pointGeometry.addAttribute('color', this.color);
        this.lineGeometry.addAttribute('color', this.color);
        this.meshGeometry.addAttribute('color', this.color);
        this.meshGeometry.addAttribute('normal', this.normals);
    }

    private linkIndex() {
        this.lineGeometry.setIndex(this.segments);
        this.meshGeometry.setIndex(this.faces);
    }

    pointGeometry = new THREE.BufferGeometry();
    lineGeometry = new THREE.BufferGeometry();
    meshGeometry = new THREE.BufferGeometry();

    position = new THREE.BufferAttribute(Pool.get(Float32Array, 0), 3).setDynamic(true);
    segments = new THREE.BufferAttribute(Pool.get(Uint32Array, 0), 2).setDynamic(true);
    faces = new THREE.BufferAttribute(Pool.get(Uint32Array, 0), 3).setDynamic(true);

    normals = new THREE.BufferAttribute(Pool.get(Float32Array, 0), 3).setDynamic(true);
    color = new THREE.BufferAttribute(Pool.get(Float32Array, 0), 3).setDynamic(true);

    object = new THREE.Group();
}

/*
 * Фабрика THREE-материалов.
 */
const matHelper = {
    point() {
        return new THREE.PointsMaterial({
            size: config.particleRadius,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true,
            vertexColors: THREE.VertexColors
        });
    },
    line() {
        return new THREE.LineBasicMaterial({
            vertexColors: THREE.VertexColors
        });
    },
    mesh() {
        return new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            opacity: .7,
            vertexColors: THREE.VertexColors,
            normalScale: new THREE.Vector2(1, 1)
            // depthWrite: false
            // depthTest: false
        });
    }
};
