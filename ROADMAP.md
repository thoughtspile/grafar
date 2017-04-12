## 4.6.0
[x] Remove / deprecate outdated APIs:
  [x] grafar.Style removed
  [x] grafar.refresh() deprecated
  [x] grafar.constant() deprecated
[ ] Optimization & fixes
  [x] Independent & reactive Pin updates
  [x] Reuse topology between constraint updates
  [ ] Propagate resize
[x] Auto-wrap number literals into generators

## 4.7.0
- High-order reactivity (accept reactive values in Generator)

## 4.8.0
- Dump ID-based selection
- Decouple rendering and computations so that computations can be run in node

## 4.9.0
- Statistical generators
- Import generators: from js objects / arrays.
- Test suite

## Rest
- Set operators (union, intersection)
- Math.* wrapper for grafar dimensions
- Push, pop, shift containers
- Reactive pipeline encapsulation
- Computed topology
- Reduce-like transforms with no forward-declaration of size and possible topology
  mutation, e.g. mean, order statistics
- GPGPU transforms and generators with custom shaders.
