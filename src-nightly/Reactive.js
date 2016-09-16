import { isExisty } from './utils';
import { repeatArray, blockRepeat, repeatPoints } from './arrayUtils';
import { union, setpush as setPush, setpop as setPop } from './setUtils';

export class Reactive {
    constructor(data) {
        this.sources = [];
        this.targets = [];

    	this.data = isExisty(data)? data: {};
    	this.fn = function() {};
    	this.isValid = false;
    }

    isReactive(obj) {
    	return obj instanceof Reactive;
    }

    push() {
        return this;
    }

    lift(fn) {
        this.fn = fn;
        this.invalidate();
        return this;
    }

    bind(newArgs) {
        this.unbind();
        newArgs.forEach(arg => setPush(arg.targets, this));
        this.sources = newArgs.slice();
        return this;
    }

    unbind() {
        this.sources.forEach(src => setPop(src.targets, this));
        this.sources.length = 0;
        this.invalidate();
        return this;
    }

    validate() {
    	if (!this.isValid) {
            const sourceData = this.sources.map(src => src.value());
            const res = this.fn(sourceData, this.data);
            if (isExisty(res)) {
                this.data = res;
            }
    		this.isValid = true;
    	}
    	return this;
    }

    invalidate() {
    	this.isValid = false;
        this.targets
            .filter(targ => targ.isValid)
            .forEach(targ => targ.invalidate());
    	return this;
    }

    value() {
        return this.validate().data;
    }
}
