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

[MIT License](LICENSE)

## Installation

Use `yarn add grafar` or `npm install grafar`.

## Links

- [Documentation](https://thoughtspile.github.io/grafar/?new)
- [API reference](https://thoughtspile.github.io/grafar/?new#api)
- [Codesandbox](https://codesandbox.io/s/grafar-template-h1k66)

## Building from source

1. Checkout latest stable release: `git clone git@github.com:thoughtspile/Grafar.git`.
2. Install dependencies with `npm install`
3. Have fun with my poor selection of npm scripts (`npm run <script name>`), ignore the warnings:
  - `dev`: build into `/build/grafar.js` and watch. No server.
  - `build`: build into `/build/grafar.js`.
All the methods produce a UMD module.
4. No automatic tests yet.
