# Grafar 4

Grafar is a javascript library for reactive, 3D mathematical visualization (data
visualization capabilities coming sometime). Built on top of WebGL (via Three.js).
If you've ever struggled with displaying lots of stuff with conventional charting
libraries (such as d3), grafar would be good for you. Another great features include:

- Reactive data flow to easily build dynamic graphs.
- Full, beautiful 3D.
- High-level building blocks for math: with a single line of code you can create
sets, ranges and sequences, and apply continuous maps to these. Currently limited
to basic math primitives, fun stuff like statistics, DSP,  and  coming someday!
- Advanced topology detection: get a surface by mapping a `[0, 1] x [0, 1]` or a
set of curves from `[0, 1] x {0, 1, 2}`.
- Ability to plug in any low-level buffer transform to do some crazy stuff.

[MIT License](LICENSE.txt)

## Installation and Usage (none of this works yet)

### ES6 via npm

```sh
npm install grafar
```

and then, somewhere in your code:

```js
import * as grafar from 'grafar';

const x = grafar.range(1, 2, 100).select();
```

### TS via npm & typings

Same as ES6, but also:

``` sh
typings install FIXME
```

### CommonJS via npm

```sh
npm install grafar
```

and then, somewhere in your code:

```js
var grafar = require('grafar');

var x = grafar.range(1, 2, 100).select();
```

### <script> tag (not cool)

Download the distro, then include it into your HTML and use normally.

```html
<script src='/path/to/grafar.js'></script>
```

## Goals

- Repair npm package.
- Examples.
- Have more generators: random numbers, basic signals.
- Data-based generators: from CSV, JSON, js objects.
- Advanced transforms (reduce-like) with no forward-declaration of size and possible topology mutation.
- GPGPU transforms and generators with custom shaders.

## Building from source

1. Checkout latest stable release: `git clone git@github.com:thoughtspile/Grafar.git`.
2. Install npm dependencies and typings: `npm run prepare`.
3. Have fun with my poor selection of npm scripts (`npm run <script name>`), ignore the warnings:
  - `dev`: build into `/build/grafar.js` and watch. No server, no live-reloading.
  - `build`: build ES5 into `/build/grafar.js`.
Both scripts output a single file that works with ES6 modules, `require` and exports
global `grafar` when included into HTML.
4. No automatic tests yet (and not in any priority), so do occasionally check
the examples (in `/examples`) to see if they still work.

If you develop in atom, you would enjoy `atom-typescript`. If you develop in
something else, find a package yourself, I really don't know.
