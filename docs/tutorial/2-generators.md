Every grafar app starts with a generator. Generator is a way to fill an array with numbers and tell grafar how to connect the points on a plot (emulating set topology). We use generators to define free variables, and other variables can depend on their output.

!> Normally, you call `select()` on the output of a generator. This is a technical detail to support some advanced use cases.

## Built-in set generators

Grafar comes with a built-in selection of generators that cover most use cases.

```js
// set is the most basic generator that wraps a numeric array for use in grafar.
const set = grafar.set([-1, 0, 1]).select();

// Despite the name, items are not required (or guaranteed) to be unique.
// grafar.set([0, 0, 0]).select() has 3 zeroes
// The array is shallow-cloned.

// seq(a, b, n) generates n numbers, spaced equally between a and b,
// including the endpoints. The points are not visually linked, giving you a set like
// { a + i * (b - a) / (n - 1) | i = 0..n }.
const seq = grafar.seq(-1, 1, 20).select();

// range() is the same as seq(), but the points are connected to emulate [a, b]
const range = grafar.range(-1, 1, 20).select();

// logseq() generates points spaced logarithmically between a and b
// More points are generated closer to a. This is useful if you want to apply a
// map that is more "wavy" around a, then gets smoother when going to b.
// In case you're wondering, { a + log(i) * (b - a) / log(n)) * (b - a) | i = 0..n }
const logseq = grafar.logseq(-1, 1, 20).select();

// ints() gives you all the integers between a and b, including the endpoints.
const ints = grafar.ints(-2, 2.5).select(); // [-2, -1, 0, 1, 2]

// this code paints the chart - ignore it for now
grafar.setup({ particleRadius: .2 });
const pan = new grafar.Panel(document.getElementById('render')).setAxes(['x', 'y']);
grafar.pin([set, -2], pan);
grafar.pin([seq, -1], pan);
grafar.pin([range, 0], pan);
grafar.pin([logseq, 1], pan);
grafar.pin([ints, 2], pan);
```

## Constant generator

In most situations, grafar also treats a JS constant as a generator. Basically, passing `9` is equivalent to passing `grafar.set([9]).select()`.

## vsolve

A final generator that we'll cover in more detail later is `vsolve`. It's used to find zeroes of a function (or plot an implicitly defined set, if you please).

```js
// Найти нули функции.
const circle = grafar.vsolve(
  // Функция. Аккуратно, аргументы передаются в массиве, а не как обычно.
  v => Math.pow(v[0], 2) + Math.pow(v[1], 2) - 2,
  // Сколько решений найти
  1000,
  // Размерность объекта. Сейчас строим неявную поверхность на плоскости, так что 2.
  2
).select();
const iPan = new grafar.Panel(document.getElementById('implicit')).setAxes(['x', 'y']);
grafar.pin(circle, iPan);
```
