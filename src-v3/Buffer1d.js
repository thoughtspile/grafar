import _ from 'lodash';

const ctor = Float32Array;

export class Buffer1d {
    constructor(size = 0) {
        this._data = new ctor(size);
        this._size = size;
    }

    size(newSize) {
        if (_.isUndefined(newSize)) {
            return this._size;
        }

        if (newSize > this._size) {
            this._data = new ctor(newSize);
        }

        this._size = newSize;

        return this;
    }

    raw() {
        return this._data;
    }
}
