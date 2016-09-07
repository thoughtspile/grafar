import { Buffer } from './buffer';

export class Block {
    constructor(size) {
        this.size = size;
        this.data = new Buffer(Float32Array).resize(size);
        this.topo = null;
    }
}
