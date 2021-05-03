User interactions are treated much like animations in grafar, albeit with a weird syntax.

```js
// this is our control variable
const p = grafar.set([0]).select();

// these are regular grafar variables
const x = grafar.range(-2, 2, 500).select();
const y = grafar.map([x, p], (x, p) => 2 * Math.sin(x + p));
grafar.pin([x, y], grafar.panel(document.getElementById('render')).setAxes(['x', 'y']));

// grafar doesn't really care how you bind to the DOM
const control = document.getElementById('value_control');
// on update...
const update = (e) => {
  // ...we read the value of the control...
  const val = Number(control.value);
  // ... and wrap it into a grafar variable
  grafar.set([val])
      // But now we call into(<control variable>) instead of select()
      .into(p);
};
control.addEventListener('input', update);
update();
```

You can also allow the user to hide and show panels using regular front-end techniques, or to [toggle the visibility of plots.](#/tutorial/1-plotting?id=toggling-plot-visibility)