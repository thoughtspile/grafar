import { Block } from './Block';

export class Set extends Block {
    constructor(elements) {
        if (!( elements instanceof Array )) {
            throw new Error('Argument of Set must be an Array');
        }
        super(elements.length);

        for (var i = 0; i < elements.length; i++) {
            this.data.array[i] = elements[i];
        }
    };
}
