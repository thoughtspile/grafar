import * as grafar from './grafar';

const x = grafar.range(0, 1, 10);
console.log(x().raw());

const y = grafar.map(x, x => 2 * x);
console.log(y().raw());
