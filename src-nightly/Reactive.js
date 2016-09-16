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
        for (var i = 0; i < newArgs.length; i++)
            setPush(newArgs[i].targets, this);
        this.sources = newArgs.slice();
        return this;
    }

    unbind() {
        for (var i = 0; i < this.sources.length; i++)
            setPop(this.sources[i].targets, this);
        this.sources.length = 0;
        this.invalidate();
        return this;
    }

    validate() {
    	if (!this.isValid) {
            var sourceData = [];
            for (var i = 0; i < this.sources.length; i++) {
                sourceData[i] = this.sources[i].value();
            }
            var res = this.fn(sourceData, this.data);
            if (isExisty(res))
                this.data = res;
    		this.isValid = true;
    	}
    	return this;
    }

    invalidate() {
    	this.isValid = false;
        for (var i = 0; i < this.targets.length; i++)
            if (this.targets[i].isValid)
                this.targets[i].invalidate();
    	return this;
    }

    value() {
        return this.validate().data;
    }
}
