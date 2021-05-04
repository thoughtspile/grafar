# Mapping data

Once we've defined the free   with [generators,](tutorial/2-generators.md) it's time to map them and make someting cool. Grafar is smart enough to track the dependencies of the variables passed to `map()` and produce the object that makes sense.

## Explicit surface: (x, y) -> z

If `map()` gets several independent variables, it calls the function for every combination of input variables and deduces the end object topology. For4 example, mapping 2 ranges gives you a surface:

<div data-sample>
  <div id="surf"></div>
</div>

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.range(-1, 1, 100).select();
const z = grafar.map([x, y], (x, y) => Math.cos(x) * Math.sin(y));
grafar.pin([x, y, z], grafar.panel(document.getElementById('surf')));
```

## 3D Curve set: (x, i) -> z

If you replace one of the ranges with a `seq()`, that produces a point set, you get a curve for each point in `seq` instead of a surface:

<div data-sample>
  <div id="lines"></div>
</div>

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.seq(-1, 1, 20).select();
const z = grafar.map([x, y], (x, y) => Math.cos(x) * Math.sin(y));
grafar.pin([x, y, z], grafar.panel(document.getElementById('lines')));
```

## Explicit curve: x -> y

Obviously, you can apply the same technique to make a 2D plot:

<div data-sample>
  <div id="curve"></div>
</div>

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.map(x, (x) => 2 * x * x);
grafar.pin([x, y], grafar.panel(document.getElementById('curve')).setAxes(['x', 'y']));
```

## Intermediate variables: x -> x', (x, x') -> y

Grafar is smart enough to know that `map([x, map(x)], fn)` is a function of `x` with one degree of freedom and not a surface.

<div data-sample>
  <div id="interim"></div>
</div>

```js
const x = grafar.range(-1, 1, 100).select();
const xTick = grafar.map(x, x => Math.pow(x, 3));
const y = grafar.map([x, xTick], (x, sqrt) => x * sqrt);
grafar.pin([x, y], grafar.panel(document.getElementById('interim')).setAxes(['x', 'y']));
```
