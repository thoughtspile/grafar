# Equation solving

The final method for generating point sets in grafar is `vsolve` that allows you to sample a zero set of a function (plot an implicit function, if you please). `vsolve` uses newton's method internally.

## Implicit surfaces

<div data-sample>
  <div id="isurf"></div>
</div>

```js
const surf = grafar.vsolve(
    // The function to be solved - a sphere, x^3 + y^2 + z^2 == 2, in this case
    // Note that the function receives a single array agrument, unlike in map()
    v => Math.pow(v[0], 3) + Math.pow(v[1], 2) + Math.pow(v[2], 2) - 2,
    // Find 50000 points that match
    50000,
    // We're solving in 3 dimensions
    3
).select();

// display as usual
grafar.pin(surf, grafar.panel(document.getElementById('isurf')));
```

`vsolve` is currently limited to generating point clouds (not a real surface with faces), and works best for smooth shapes located around zero.
