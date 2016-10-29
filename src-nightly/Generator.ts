import * as _ from 'lodash';

import { GrafarObject, ConstraintData } from './GrafarObject';
import { isExisty, extractUid, makeID } from './utils';
import { registry } from './registry';

export class Generator {
    constructor(private anonymousConstraint: ConstraintData) {
    }

    select() {
        const names = _.range(this.getDimension())
            .map(() => makeID());
        this.anonymousConstraint.what = names;
        return registry.extern(this.anonymousConstraint);
    }

    into(names: string[]) {
        /** TODO normalize names */
        const expectDim = this.getDimension();
        if (names.length !== expectDim) {
            throw new Error(`Cannot apply generator: expected ${ expectDim }-dimensional selection, got ${ names.length }`);
        }

        this.anonymousConstraint.what = names;
        return registry.constrain(this.anonymousConstraint);
    }

    private getDimension() {
        const constraintDim = this.anonymousConstraint.dimension;
        return isExisty(constraintDim)? constraintDim: 1;
    }
}
