##General
  * [x] Propose restructure.
  * [ ] Alternate generators.
    * [ ] csv
	* [ ] JSON
	* [ ] graph data
  * [ ] Need moar demos.
  * [ ] Annotate source.
  * [ ] Write decent documentation.
    * [ ] Update existing (4.09)
	* [ ] Put into wiki
  * [ ] Compile in several flavours.
  * [ ] Allow runtime configuring.
    * [x] Check config fields (4.09)
	* [ ] Should some fields be added to the config?
	* [ ] merge configs from G & GY (would this work with part-compiles?)
  * [ ] Polyfills.
    * [x] Typed Arrays
	* [ ] ES5 array methods
  * [ ] launcher.js default path.
  
##Performance
  * [ ] Common event loop with load balancing and stats.
    * [x] Add grafar.stats object
	* [ ] Fill that object with useful properties
	* [x] Report creating
	* [ ] Common event loop
	* [ ] Load balancing based on execution times
  * [ ] Performance cleanup.
    * [ ] drawTextLabel: store canvas || hint: canvas is stored by reference in texture (4.09)
	* [ ] validate any allocations
	* [x] expose ArrayPool and use it in indexArrays and WebGL buffer allocation.
  
##Grafaryaz parser
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

##Tables
  * [x] Adopt a table-centered process
  * [x] Increase the naming consistency with DB
    * [x] map -> update
  * [x] select -> select + export
    * [ ] Implement filtering in select.
    * [ ] views (select output) with blank drop
	* [x] asInterleaved
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
    * [ ] Create the universal table
  * [ ] Add extras to update.
    * [x] continuous
	* [ ] actual size (ivalidTail or what?)
	* [ ] ordered
  * [x] Move Table to a separate accessible class.

##Grafar rendering
  * [ ] Add triangle plot.
  * [ ] Add arrows.
  * [ ] Add custom attributes
	* [ ] size
	* [ ] length
	* [ ] color
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
  * [ ] FOV objects
  
##Grafar Graphs.
  * [ ] Tree -> class + id to allow for overlapping classes.
  * [ ] Where do coordinate permutations fit in?

##Style
  * [ ] Dig into colour schemes (nicer feel).
  * [ ] Add hierarchical hue distance.
  * [ ] Single-hue colour schemes for ordinal data.
  * [ ] Particle size should depend on scale
  * [ ] custom converter (hex <-> lab)
  
##Grafaryaz planner
  * [ ] Bug: if a value is mapped onto and required on several steps, the map is performed more than once.
  * [ ] Dig into parallelization options.
  * [ ] Better / faster step structure
    * [ ] Test performance of R^n->R^m maps vs R^n->R^1.
    * [ ] condense or sparse steps.
  * [ ] Set-maps (many-to-many)
	
##Bugs
  * [ ] {a, b, c}, y(a,b), x(a,b,c): x and y tabs can't be properly aligned
  
## Misc
  * [ ] subsystems
  * [ ] named / indexed cols
  * [ ] interface nodes
  * [ ] auto-vectorisation
  * [ ] closed shape adjacency
