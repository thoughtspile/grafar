##1. General
  * [ ] Propose restructure.
  * [ ] Alternate generators.
    * [ ] csv
	* [ ] JSON
	* [ ] graph data
  * [ ] Need moar demos.
  * [ ] Annotate source.
  * [ ] Write decent documentation.
    * [ ] Update existing (4.09)
	* [ ] Put into wiki
  * [ ] Performance cleanup.
    * [ ] drawTextLabel: store canvas || hint: canvas is stored by reference in texture (4.09)
	* [ ] validate any allocations
	* [ ] expose ArrayPool and use it in indexArrays and WebGL buffer alloc
  * [ ] Compile in several flavours.
    * [ ] with Three
	* [ ] minimal Three
	* [ ] no Three
	* [ ] parser only (+ table?)
	* [ ] table only
	* [ ] renderer + table
  * [ ] Common event loop with load balancing and stats.
  * [ ] Allow runtime configuring.
    * [x] Check config fields (4.09)
	* [ ] Should some fields be added to the config?
	* [ ] merge configs from G & GY (would this work with part-compiles?)
  * [ ] Polyfills.
    * [ ] Typed Arrays
	* [ ] ES5 array methods
  * [ ] launcher.js default path.
  
##2. Grafaryaz parser
  * [ ] Allow infinite domains based on FOV.
    * [ ] accessors for camera position
	* [ ] passing parameters to GY (or other syncing)
	* [ ] Rewrite seq for undefined top / bottom
  * [ ] Detect periodic functions and speed up via "instancing".
    * [ ] identify periodic functions
	* [ ] identify the period
	* [ ] split into the periodic and aperiodic partss
	* [ ] how does the period translate with substitution (e.g. P(sin(t)))
  * [ ] What about the benefits of using interpolation?
  * [ ] Use algorithmic / symbolic differentiation.
  * [ ] Use interval arithmetic.
    * [ ] Dig into symbolic extrema
	* [ ] Implement base class for interval operators and functions
	* [ ] Uses: find out if roots exist, project along
  * [ ] discontinuity detection.
  * [ ] Border / fill mode.
  * [ ] clean the mess in base parser.

##3. Tables
  * [ ] Fix g-descriptors.
    * [x] In-table logic (1.09)
	* [x] Move to Typed Arrays (2.09)
	* [x] Pre-determine length (2.09)
	* [x] Move length determination to separate function (2.09)
	* [ ] String is poor format for gDesc
	* [ ] Implement in static memory
	* [ ] Memo minGraphDescriptor (or move to table ops)
	* [ ] Memo indexBufferSize
	* [ ] Smaller items based on data length (Uint8 etc.)
	* [x] WTF happened to another half of edges? (2.09)
	* [x] Check table memoization (2.09)
  * [ ] Split proxies into projection and undefined column.
  * [ ] Add extras to map.
    * [x] continuous
	* [ ] actual size (ivalidTail or what?)
	* [ ] ordered
  * [ ] Implement filtering in select.
  * [ ] Split select into *real* select and asSometing.
    * [ ] views (select should return one).
	* [ ] asArrayBuffer.
  * [ ] Move Table to a separate accessible class.

##4. Grafar rendering
  * [ ] Add triangle plot.
  * [ ] Add arrows.
  * [ ] Add custom attributes
	* [ ] size
	* [ ] length
	* [ ] what else?
  * [ ] Axis stretching to fit (related to FOV).
  * [ ] Bug: axis resizing.
  * [ ] Set camera position. (Maybe some automation.)
  * [ ] Other plot types
    * [ ] bar charts
	* [ ] review 1D plots
	* [ ] what else?
  * [ ] Dig axis labelling position
  * [ ] Implement axis ticks
  * [ ] Fix canvas rendering
  
##5. Grafar Graphs.
  * [ ] Tree -> class + id to allow for overlapping classes.
  * [ ] Where do coordinate permutations go?

##6. Style
  * [ ] Dig into colour schemes (nicer feel).
  * [ ] Add hierarchical hue distance.
  * [ ] Single-hue colour schemes for ordinal data.
  * [ ] Particle size should depend on scale
  
##7. Grafaryaz planner
  * [ ] Bug: if a value is mapped onto and required on several steps, the map is performed more than once.
  * [ ] Dig into parallelization options.
  * [ ] Better / faster step structure
    * [ ] Test performance of R^n->R^m maps vs R^n->R^1.
    * [ ] condense or sparse steps.
