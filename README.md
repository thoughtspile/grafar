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

[This is not an open-source project! Look but don't touch.](LICENSE.txt)

## Installation

Get the latest build from ./dist/grafar.js/raw or use `npm install grafar`.

## Goals

- Have more generators: random numbers, basic signals.
- Data-based generators: from CSV, JSON, js objects.
- Advanced transforms (reduce-like) with no forward-declaration of size and possible topology mutation.
- GPGPU transforms and generators with custom shaders.

## Building from source

1. Checkout latest stable release: `git clone git@github.com:thoughtspile/Grafar.git`.
2. Install npm dependencies and typings: `npm run prepare`.
3. Have fun with my poor selection of npm scripts (`npm run <script name>`), ignore the warnings:
  - `dev`: build into `/build/grafar.js` and watch. No server.
  - `build`: build into `/build/grafar.js`.
  - `dist`: minified build into `/dist/grafar.js`
All the methods produce a UMD module.
4. No automatic tests yet (and not in any priority), so do occasionally check
the examples (in `/examples`) to see if they still work.

If you develop in atom, you would enjoy `atom-typescript`. If you develop in
something else, find a package yourself, I really don't know.
