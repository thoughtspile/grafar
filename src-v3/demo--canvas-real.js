import * as grafar from './grafar';

import { Map } from './transforms';
import { bind, Tick } from './bind-mixin';

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

// Primitives

let t = grafar.point(0);
let x = grafar.range(0, 500, N);
let i = grafar.ints(-2, 2);

// Unification (should be automated)

const ixt = grafar.cart([i, x, t]);

// Mapping

const y = bind((i, x, t) => 200 * (1 + Math.sin(t * i + Math.cos(i + x / 20))), ixt);

const graph = grafar.zip([ixt, y]);

// Rendering

const colors = [
    '#0000ff',
    '#000088',
    '#000000',
    '#880000',
    '#ff0000'
];
const draw = bind((ixty) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // very bad, can't bind zip for deep arg
    ixty.each((i, x, t, y) => {
        ctx.fillStyle = colors[i + 2];
        ctx.fillRect(x, y, 1, 1);
    });
}, graph);

// Animate

[
    // () => t.setData(t.getData() + .01),
    draw
].forEach(Tick.on);
