## 4.6.0
- Remove / deprecate outdated APIs:
  - grafar.Style removed
  - grafar.refresh() deprecated
  - grafar.constant() deprecated
- Optimization
  - Independent & reactive Pin updates
  - Reuse topology between constraint updates
- Auto-wrap number literals into generators

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
- Reactive pipeline encapsulation
- Computed topology
- Reduce-like transforms with no forward-declaration of size and possible topology
  mutation, e.g. mean, order statistics
- GPGPU transforms and generators with custom shaders.
