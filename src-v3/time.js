import Buffer1d from './buffer-1d';
import { Set } from './buffer-nd';
import { map, each } from './transforms';
import { ints, Generator } from './generators';
import { cart, zip } from './combine';


let preMillion = ints(0, 1000000);

function run() {
    ints(0, 1000000, preMillion)
}

for (var i = 0; i < 100; i++) run();

if (typeof(window) !== undefined)
    window.run = run;
