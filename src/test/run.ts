import { registry } from '../core/registry';

const x = registry.extern({
    what: 'x',
    maxlen: 1,
});

const y = registry.extern({
    using: [x],
    what: 'y',
});

console.log('should be 1', registry.project(y).data[0].value());

registry.extern({
    what: 'x',
    maxlen: 2,
});

console.log('should be 2', registry.project(y).data[0].value());
