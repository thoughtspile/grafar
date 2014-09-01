##1. General
  * [ ] Propose restructure.
  * [ ] Alternate generators.
  * [ ] Need moar demos.
  * [ ] Annotate source.
  * [ ] Decent documentation.
  * [ ] Performance cleanup.
  * [ ] Compile in several flavours.
  * [ ] Common event loop with balancing and stats.
  * [ ] Allow runtime configuring.
  * [ ] Polyfills.
  
##2. Grafaryaz parser
  * [ ] Fix index buffer.
  * [ ] Allow infinite domains based on FOV.
  * [ ] Detect periodic functions and speed up via "instancing".
  * [ ] Use algorithmic differentiation.
  * [ ] Use interval arithmetic.
  * [ ] Some discontinuity detection.
  * [ ] Border / fill mode.
  * [ ] Mess cleaning in base parser.
  * [ ] launcher.js default path.

##3. Tables
  * [ ] Fix g-descriptors.
    * [x] In-table logic
	* [ ] Move to Typed Arrays
	* [ ] Check memoization
  * [ ] Split proxies into projection and undefined column.
  * [ ] Add extras to map.
  * [ ] Implement filtering in select.
  * [ ] Implement views (select should return one).
  * [ ] Split select into *real* select and asSometing.
  * [ ] Move to a separate class.

##4. Grafar rendering
  * [ ] Add triangle plot.
  * [ ] Add arrows.
  * [ ] Add custom attributes (size, length, etc).
  * [ ] Axis stretching to fit.
  * [ ] Bug: axis resizing.
  * [ ] Set camera position. (Maybe some automation.)
  * [ ] Other plot types (like bar chart)
  * [ ] Dig axis labelling position
  * [ ] Implement axis ticks
  
##5. Grafar Graphs.
  * [ ] Tree -> class + id to allow for overlapping classes.

##6. Style
  * [ ] Dig into colour schemes (nicer feel).
  * [ ] Add hierarchical hue distance.
  * [ ] Single-hue colour schemes for ordinal data.
  * [ ] Particle size should depend on scale
  
##7. Grafaryaz planner
  * [ ] Known bug: if a value is mapped onto and required on several steps, the map is performed more than once.
  * [ ] Dig into parallelization options.
  * [ ] Test performance of R^n->R^m maps vs R^n->R^1.
  * [ ] \(Based on 7.3\) condense or sparse steps.
