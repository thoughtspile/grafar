import Buffer1d from './buffer-1d';
import Set from './buffer-nd';
import { map, each } from './transforms';
import { ints, Generator } from './generators';
import { cart, zip } from './combine';
import Nanotimer from 'nanotimer';

const log = console.log.bind(console);


let buff = new Buffer1d();
console.log(buff, buff.size());
buff.size(3);
console.log(buff, buff.size());

let set0d = new Set();
console.log(set0d, set0d.size());

let set2d = new Set(2);
console.log(set2d, set2d.size());
set2d.size(3);
console.log(set2d, set2d.size());

let comp1 = Generator.into(i => i + 1, new Set(1, 3));
let comp2 = Generator.into(i => 10 * (i + 1), new Set(1, 3));
zip([comp1, comp2], set2d);
console.log('zip: ', comp1.raw(), comp2.raw(), set2d.raw());

let set1d = new Set(1, 3);
map(set2d, (x, y) => x + y, set1d);
console.log('sum:', set1d.raw());

let targ2d = new Set(2, 3);
map(set2d, [(x, y) => x + y, (x, y) => x * y], targ2d);
console.log('\n\tsum and product:');
console.log(targ2d.raw());

console.log('\n\t0..5')
each(ints(0, 5), log);

let int2 = ints(0, 1);
console.log('\n\t{0, 1}')
each(int2, log)

console.log('\n\tdouble cube');
each(cart([int2, int2], new Set(2, 4)), log);

console.log('\n\ttriple cube')
const sqr3 = cart([int2, int2, int2], new Set(3, 8));
each(sqr3, log);

console.log('\n\titerative triple cube')
const step1 = cart([int2, int2], new Set(2));
console.log('\nstep 1')
each(step1, log);
const step2 = cart([step1, int2], new Set(3));
console.log('\nstep 2')
each(step2, log);
