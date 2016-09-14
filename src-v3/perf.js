import { Set } from './Set';
import { ints, Generator } from './generators';
import mus from 'microseconds';


const time = (fn) => {
    const start = mus.now();
    fn();
    return mus.since(start) / 1000;
};
const N = 2;
const bunch = (header, fn, each) => {
    let sum = 0;
    for (var i = 0; i < N; i++) {
        const ms = time(fn);
        sum += ms;
        if (each) console.log(header, i, ':', ms);
    }
    console.log(header, ' AVG:', sum / N, '\n');
};

let buff = ints(0, 1000000);

bunch('ints', () => ints(20, 1000020, buff));
bunch('custom gen', () => Generator.into(i => i + 2, buff));
let val = 0;
const gen = new Generator(i => i + val);
bunch('prepared', () => { val++; gen.into(buff); });
