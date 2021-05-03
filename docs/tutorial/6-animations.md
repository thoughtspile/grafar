Grafar relies on reactive programming to manage updates. It tracks the dependencies of each variable to decide when a plot should be updated, and what data it should recompute.

The most convenient way to animate something in grafar is to use a `ms()` generator. Every frame it self-invalidates and schedules the update of any dependent variables.  __Note__ that, unlike other generators, it calls its own `select()` internally, so there's no need to do it yourself.

```js
const x = grafar.range(-3, 3, 100).select();
const y = grafar.range(-3, 3, 100).select();
// Here is the timer
const t = grafar.ms();
// ms() are pretty fast, so you would normally divide them by some value
// to slow down the movement to a sensible speed:
const sec = grafar.map(t, t => t / 1000);

// Now the timer can be used as a regular grafar variable:
const z = grafar.map([x, y, sec], (x, y, s) => Math.sin(x + y) * Math.cos(s));
grafar.pin([x, y, z], grafar.panel(document.getElementById('render')));
```

`ms()` generator can be safely reused between several charts, but having multiple timers does will not hurt either.

`ms()` can yield at fractional milliseconds. If you need discrete time, use `Math.floor()` as usual:

```js
const x = grafar.range(-3, 3, 100).select();
const y = grafar.range(-3, 3, 100).select();
const t = grafar.ms();

// The only change is here - iSec now contains an integer number of
// seconds since start, and you can...
const iSec = grafar.map(t, t => Math.floor(t / 1000));

// ...use integer operators like % on it or access an external array or anything
const z = grafar.map([x, y, iSec], (x, y, i) => Math.sin(x + y) * (i % 2));
grafar.pin([x, y, z], grafar.panel(document.getElementById('render')));
```