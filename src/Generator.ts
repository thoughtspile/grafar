import * as _ from 'lodash';

import { GrafarObject, ConstraintData } from './core/GrafarObject';
import { isExisty, makeID } from './utils';
import { registry } from './core/registry';

/**
 * Генератор - не-материализованное описание измерения.
 * Можно сделать его новой графар-переменной (.select()),
 * можно обновить старую (.into(target));
 */
export class Generator {
    constructor(private anonymousConstraint: ConstraintData) {
    }

    /**
     * Материализовать генератор
     */
    select() {
        const names = _.range(this.getDimension())
            .map(() => makeID());
        this.anonymousConstraint.what = names;
        return registry.extern(this.anonymousConstraint);
    }

    /**
     * Почтему source.into(target), а не target.set(source)?
     * Чтобы иметь возможность группировать target через простой массив
     * Особенно это касается n-мерных генераторов: grafar.vsolve(...).into([x, y, z]);
     */
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
