import * as grafar from './grafar';

import { Map, map, each } from './transforms';
import { zip } from './combine';
import { bind, Tick, volatile } from './bind-mixin';

const N = 1000;

let ctx = {
    clearRect: () => {},
    fillRect: () => {}
};
let canvas = {};
if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
}

let t = 0;
let x = grafar.range(0, 500, N);
let i = grafar.ints(-2, 2);
const colors = [
    '#0000ff',
    '#000088',
    '#000000',
    '#880000',
    '#ff0000'
];

const ix = grafar.cart([i, x]);
const itemMap = (i, x) => 200 + 200 * Math.sin(Math.sin(t * i) + Math.cos(i + x / 20));
const fn = volatile(new Map([ itemMap ]).cache(new grafar.Set(1)));
const y = bind((fn, arg) => fn.arg(arg).exec(), fn, ix); // poor design with conext change
const draw = bind((ix, y) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // very bad, can't bind zip for deep arg
    zip([ix, y]).each((i, x, y) => {
        ctx.fillStyle = colors[i + 2];
        ctx.fillRect(x, y, 1, 1);
    });
}, ix, y);

[() => t += .01, draw].forEach(Tick.on);
