Once we've defined the free   with [generators,](tutorial/2-generators.md) it's time to map them and make someting cool. Grafar is smart enough to track the dependencies of the variables passed to `map()` and produce the object that makes sense.

## Explicit surface: (x, y) -> z

If `map()` gets several independent variables, it calls the function for every combination of input variables and deduces the end object topology. For4 example, mapping 2 ranges gives you a surface:

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.range(-1, 1, 100).select();
const z = grafar.map([x, y], (x, y) => Math.cos(x) * Math.sin(y));
grafar.pin([x, y, z], grafar.panel(document.getElementById('surf')));
```

## 3D Curve set: (x, i) -> z

If you replace one of the ranges with a `seq()`, that produces a point set, you get a curve for each point in `seq` instead of a surface:

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.seq(-1, 1, 100).select();
const z = grafar.map([x, y], (x, y) => Math.cos(x) * Math.sin(y));
grafar.pin([x, y, z], grafar.panel(document.getElementById('surf')));
```

## Explicit curve: x -> y

Obvoiusly, you can apply the same technique to make a 2D plot:

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.map([x, y], (x, y) => x * x);
grafar.pin([x, y], grafar.panel(document.getElementById('curve')).setAxes(['x', 'y']));
```

## Intermediate variables: x -> x', (x, x') -> y

Grafar is smart enough to know that `map([x, map(x)], fn)` is a funcion of `x` with one degree of freedom and not a surface.

```js
const x = grafar.range(-1, 1, 100).select();
const xTick = grafar.map(x, x => Math.sqrt(x));
const y = grafar.map([x, xTick], (x, sqrt) => x * sqrt);
grafar.pin([x, y], grafar.panel(document.getElementById('curve')).setAxes(['x', 'y']));
```

## Parametric curve: t -> (x, y)

## Parametric surfaces: (p, q) -> (x, y, z)

```js
// Построим параметрическую кривую:
const t = grafar.range(0, 2 * Math.PI, 2000).select();
const curve = [
  grafar.map(t, t => Math.sin(t)),
  grafar.map(t, t => Math.cos(t)),
  grafar.map(t, t => Math.sin(t) * Math.cos(t))
];
grafar.pin(curve, new grafar.Panel(document.getElementById('curve')));


// Теперь явную поверхность:
const x = grafar.range(-1, 1, 100).select();
const y = grafar.range(-1, 1, 100).select();
const z = grafar.map([x, y], (x, y) => Math.cos(x) * Math.sin(y));
grafar.pin([x, y, z], new grafar.Panel(document.getElementById('surf')));


// Возможно, парочку параметрических поверхносей?
const p = grafar.range(-1, 1, 100).select();
const q = grafar.range(0, 2, 100).select();
const i = grafar.ints(0, 2).select();

const xp = grafar.map([p, q], (p, q) => p - q);
const yp = grafar.map([p, q], (p, q) => p + q);
const zp = grafar.map([p, q, i], (p, q, i) => Math.sin(q + p) + i);

grafar.pin([xp, yp, zp], new grafar.Panel(document.getElementById('psurf')));
```