##1. General
  1.1 [ ] Propose restructure.
  1.2 [ ] Alternate generators.
  1.3 [ ] Need moar demos.
  1.4 [ ] Annotated source.
  1.5 [ ] Decent documentation.
  1.6 [ ] Performance cleanup.
  1.7 [ ] Compile in several flavours.
  1.8 [ ] Common event loop with balancing and stats.
  1.9 [ ] Allow runtime configuring.
  1.10 [ ] Polyfills.
  
##2. Grafaryaz parser
  2.1 [ ] Fix g-descriptors.
  2.2 [ ] Fix index buffer.
  2.3 [ ] Allow infinite domains based on FOV.
  2.4 [ ] Detect periodic functions and speed up via "instancing".
  2.5 [ ] Use algorithmic differentiation.
  2.6 [ ] Use interval arithmetic.
  2.7 [ ] Some discontinuity detection.
  2.8 [ ] Border / fill mode.
  2.9 [ ] Mess cleaning in base parser.
  2.10 [ ] New bug found on 29.08.14: the axis indices are screwed up (probably during forwarding).

##3. Tables
  3.1 [ ] Split proxies into projection and undefined column.
  3.2 [ ] Add extras to map.
  3.3 [ ] Implement filtering in select.
  3.4 [ ] Implement views (select should return one).
  3.5 [ ] Split select into *real* select and asSometing.
  3.6 [ ] Move to a separate class.

##4. Grafar rendering
  4.1 [ ] Add triangle plot.
  4.2 [ ] Add arrows.
  4.3 [ ] Add custom attributes (size, length, etc).
  4.4 [ ] Axis stretching to fit.
  4.5 [ ] Camera synchronisation.
  
##5. Grafar Graphs.
  5.1 [ ] Tree -> class + id to allow for overlapping classes.

##6. Style
  6.1 [ ] Dig into colour schemes (nicer feel).
  6.2 [ ] Add hierarchical hue distance.
  6.3 [ ] Single-hue colour schemes for ordinal data.
  
##7. Grafaryaz planner
  7.1 [ ] Known bug: if a value is mapped onto and required on several steps, the map is performed more than once.
  7.2 [ ] Dig into parallelization options.
  7.3 [ ] Test performance of R^n->R^m maps vs R^n->R^1.
  7.4 [ ] (Based on 7.3) condense or sparse steps.