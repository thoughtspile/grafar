Picking up where we left off in [the map() section](tutorial/3-mapping.md), we'll see how easy it is to create parametric plots in grafar.

## Parametric curve: t -> (x, y)

We can make parametric curves in any number of dimensions — let's try a curve in a 3D space just to be fancy:

<div data-sample>
  <div id="param-curve"></div>
</div>

```js
const t = grafar.range(0, 2 * Math.PI, 2000).select();
// note how we don't actually display t on the panel, only x, y, and z that depend on it
grafar.pin([
  grafar.map(t, t => Math.sin(t)),
  grafar.map(t, t => Math.cos(t)),
  grafar.map(t, t => Math.sin(t) * Math.cos(t))
], grafar.panel(document.getElementById('param-curve')));
```

## Parametric surfaces: (p, q) -> (x, y, z)

Similarly, if we wanted to make a parametric _surface_ instead, we just need 2 parameters instead of one:

<div data-sample>
  <div id="psurf"></div>
</div>

```js
const p = grafar.range(-1, 1, 100).select();
const q = grafar.range(0, 2, 100).select();

const xp = grafar.map([p, q], (p, q) => p - q);
const yp = grafar.map([p, q], (p, q) => p + q);
const zp = grafar.map([p, q], (p, q) => Math.sin(q + p));

grafar.pin([xp, yp, zp], new grafar.Panel(document.getElementById('psurf')));
```
