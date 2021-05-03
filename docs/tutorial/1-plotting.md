To show the beautiful visualizations we produce, grafar uses a `Panel`, which is just a WebGL context bound to a canvas inside a DOM node. Grafar magically tracks the updates you make to your data and schedules a panel update. Grafar is not restricted to this rendering method, but currently it works the best.

## Our first panel

<div data-sample>
  <div id="render"></div>
</div>

```js
// Dismiss this for now, we'll cover generators soon
const x = grafar.range(-1, 1, 20).select();
const y = grafar.range(-1, 1, 20).select();
const z = grafar.map([x, y], (x, y) => x * y);

// Pick a DOM element to draw the graph in
const container = document.getElementById('render');
// And create a panel in it
const pan = new grafar.Panel(container);

// pin([x, y, z]) displays a plot with default color
const plainGraph = grafar.pin([x, y, z], pan);

// We can pin() multiple plots on a single panel
const upperGraph = grafar.pin([x, y, grafar.map(z, z => z + 1)], pan);

// We can also pass dynamic colors using an object form of pin()
const colorGraph = grafar.pin({ axes: [x, y, z], color: [x, y, z] }, pan);
```

## Toggling plot visibility

`pin()` returns an object that allows you to show or hide the graphs independently via `hide()` method:

```js
const control = document.getElementById('type');
const selectVisible = value => {
  Object.keys(graphs).forEach(key => {
    graphs[key].hide(control.value !== key);
  });
};
selectVisible();
control.addEventListener('change', selectVisible);
```

## Setting axes and making 2D plots

Panels have a `setAxes` method that allows you to set axis labels. As a neat side effect, it also allows you to make the panel show 2D graphs:

<div data-sample>
  <div id="render2d"></div>
</div>

```js
const x = grafar.range(-1, 1, 100).select();
const y = grafar.map(x, x => 2 * Math.sin(x));
const pan = grafar.panel(document.getElementById('render2d'));

// Passing 2 labels makes the panel 2D
pan.setAxes(['xs', 'ys']);

// Now you only need to pass 2 varibles to pin():
grafar.pin([x, y], pan);
// Color, naturally, still has [r, g, b] components:
grafar.pin({ axes: [y, x], color: [x, y, x] }, pan);
```
