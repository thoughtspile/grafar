The API is designed to be used as `import * from 'grafar'`, but you may also `import { panel, pin, map,seq } from 'grafar'`

## Plotting

Visualizations in grafar are created by piping data to a `Panel`, which is a wrapper for a WebGl context rendered to a `<canvas>`. Plots are automatically updated when the underlying data changes.

### grafar.panel

Creates a panel in a specified DOM node. Sugar on top of `new grafar.Panel(container: <DOM node>)`. For example, if your HTML looks like

```html
<div id="pan" style="width: 100%; height: 500px"></div>
```

You would create a panel with:

```js
let node = document.getElementById('pan');
let pan = grafar.panel(node);
```

Make sure to explicitly set the dimensions of a panel container via CSS.

### grafar.pin

Show data on a panel:

```js
grafar.pin([x, y, z], panel): Pin
```

To add dynamic colors to the plot:

```js
grafar.pin({ axes: [x, y, z], color: [r, g, b] }, panel): Pin
```

You can pin several plots onto one panel.

### pin.hide

Toggles visibility of a pin:

```js
const surf = grafar.pin([x, y, z], panel);
// hide surf
surf.hide(true);
// and show after 10 seconds
setTimeout(() => surf.hide(false));
```

### panel.setAxes

Sets axis labels from a string array. Passing 2 names forces a panel to be a 2D plot.

```js
// create a 2D plot
const pan2d = grafar.panel(node).setAxes(['a', 'b']);
// create a 3d plot
const pan3d = grafar.panel(node).setAxes(['a', 'b', 'c']);
```

## Generators

Generators are a core concept of grafar — you use them to define independent variables. Grafar comes with a set of built-in generators for common use cases. Normally, a generator call is followed by a `select` (with the exception of `grafar.ms`, see below):

```js
grafar.pin([
  grafar.set([1,2,3]).select(),
  grafar.set([1,2,3]).select(),
], panel);
// displays 9 points on a panel
```

### set(array, discrete=true)

Wraps an arbitrary numeric array for use in grafar. Creates a point set (disconnected) by default:

```js
grafar.set([1, 2, 3]).select();
```

To create a "range", where the points are connected, set a second argument to `false`:

```js
grafar.set([1, 2, 3], false).select();
```

### [Deprecated] constant

Grafar accepts plain JS numbers wherever it accepts a selection, so there is no need to wrap numbers any more.

### ints(min, max)

All integers between `min` and `max`, including the endpoints (if they are integer):

```js
grafar.ints(1, 3).select() // set([1, 2, 3])
grafar.ints(-1.15, 0.2).select() // set([-1, 0])
```

### seq(min, max, n)

`n` numbers equally spaced between `min` and `max`, disconnected.

```js
grafar.seq(-1, 1, 3).select() // set([-1, 0, 1])
```

### range(min, max, n)

`n` numbers equally spaced points between `min` and `max`, connected.

```js
grafar.range(0, 1, 101).select() // set([0, 0.01, 0.02, ..., 1], false)
```

### logseq(min, max, n)

`n` numbers spaced logarithmically between `min` and `max`, connected. Generates more points closer to `min`.


### vsolve(fn, n, dof)

An equation solver that finds `n` zeroes of a function in `DoF` dimensions. Generates a disconnected point cloud. `fn` gets called with an _array_ of coordinates and sould return a function value.

```js
// 2D solver
var curve = grafar.vsolve((v) => v[0] + v[1] - 2, 1000, 2).select();
// 3D solver
var surf = grafar.vsolve((v) => v[0] + v[1] - v[2], 10000, 3).select();
```

### ms

Microsecond timer used for creating animations. Starts at 0 and invalidates itself every frame. __Note__ that you don't need to call `.select()` when using `ms`.

```js
let t = grafar.ms();
let x = grafar.range(0, 1, 20).select();
// now you can create an animated variable
let y = grafar.map([x, t], (x, t) => Math.sin(x + t));
```

### generator.select / into

As mentioned earlier, a generator is normally converted to a `Selection` before use:

```js
let x = grafar.set([0]).select();
```

However, you may also set an existing selection to a new generator:

```js
let x = grafar.set([0]).select();
grafar.set([0, 1]).into(x);
// now x is set([0, 1]) and all the dependent variables are marked for update
```

## Mapping with grafar.map(variables[], fn)

Grafar automatically tracks the dependencies of your functions and updates the result whenever any of the dependencies change. `map` also infers the correct shape of the data from the dependencies of the variables passed to it.

If the variables are independent, you get a surface: for every point in `x` and every point in `y`, the function is called with `(x, y)`:

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.range(-1, 1, 100).select();
const z = grafar.map([x, y], (x, y) => x * y);
```

However, if the variables depend on each other, `map` respects this:

```js
const x = grafar.range(-1, 1, 100).select();
const sqr = grafar.map(x, x => x * x);
const line = grafar.map([x, sqr], (x, sqr) => x + sqr);
// produces a line equivalent to grafar.map([x], x => x + x * x);
```

You can nest the variables in the array, and `fn` will always receive flat numeric arguments in depth-first order:

```js
// produces 2 independent variables
const circle = grafar.vsolve(([x, y]) => x * x + y * y - 3, 1000, 2).select();
const level = grafar.set([-1, 0]).select();
// creates 2 copies of circle
const z = grafar.map([circle, level], (x, y, l) => Math.sin(x) + Math.cos(y) + l);
```

## Misc

### grafar.version

Get currently runnging grafar version

```js
grafar.version
```

### grafar.setup

Update global settings (see [/src/config.ts](../src/config.ts)).
