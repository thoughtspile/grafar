#Grafar quick reference

##What's included

* Three.js r68 (with orbit controls and detector) by mrdoob
* i-color by shushik
* grafar -- a WebGL-based library for displaying large amounts of data efficiently.
* grafaryaz -- a source-to-source compiler for translating systems of equations 
into executable JavaScript code.

##Getting started

To get your own copy of grafar, click "Download zip" button on the right. In 
order for the linking to work properly, unpack the archive into a folder called 
`js/` in your project, like this:
```
projectDirectory/
	js/
		libs/
		grafar/
		grafaryaz/
		loader.js
		[some custom scripts]
	[your HTML files here]
```

Since I never took the time to build the library, it is somewhat tricky to 
include into your html. I would recommend referencing the `loader.js` file. 
It uses LABjs library to download all the project files in the right order 
and run your code (passed in a callback function) once the files are loaded. 
So, you'd probably want something like this:
```html
<script type="text/javascript" src="js/loader.js"></script>
<script type="text/javascript">
	runGrafar(function() { ... some code here ... });
</script>
```
Of course, you are very welcome to mess it all up! Just remember, the order 
matters. By the way, take a look at the demos in the `examples` folder -- 
they do cover the basic usage quite well. Please refer to the example `grafar_basic_usage.html`.

##Using grafar.

###Creating panels.

A panel forms is the area in which your graphs are drawn. It corresponds to 
an html `figure` (use a `div`, if you're feeling non-semantic) and a WebGl
context.

First, you need to create and position the HTML elements that would be used 
for displaying your graphs. See `grafar_panel_basics.html` for a reference on
how to achieve this via basic HTML and CSS positioning.

Then you should initialize a panel inside such an element. All the area 
available would be occupied by the panel (if you are curious, a WebGL context 
and a camera are created, their output is binded to a `canvas` element, which 
is then appended to the `figure` specified).

#### `new grafar.Panel(<DOM element>, [{id: <string>}])`

Create a new panel inside the DOM element specified. If the `id` is not passed,
a random one is generated. The Panel created is then stored in a special table 
and can be accessed as `grafar.panels[<id>]`.

#### `<Panel object>.setAxes(<Array of strings>)`

Assign the names to the axes. Default is `['x', 'y', 'z']`. You can assign 
two axes to make the panel 2D (planar). Only the graphs appended to the panel
*after* this change would use the new axis set. The instance 
of `Panel` on which the method was called is returned.

#### `<Panel object>.drawAxes(<number>)`

Display the axes of the given length. The instance of `Panel` on which the 
method was called is returned.

###Creating graphs

The Graph is a basic display unit in grafar. It acts as a container for your 
data and provides some styling options, namely:
* color (a palette, actually -- refer to docs on grafar.Style),
* visibility (show / hide),
* corresponding panel,
* parent graph.
The first three properties are inherited from the parent, if not set explicitly. 
The graphs present in a scene form a tree structure. When grafar is launched, 
the root graph, called `$`, is created. It is a predecessor of any graph. Refer
to `grafar_graph_basics.html` for an example.

#### `new grafar.Graph([<config>])`

Create a new empty graph. If the `config` object passed to this function does 
not contain a property `id`, a random id is generated. The Graph is then stored 
and can be accessed as `grafar.graphs[<id>]`. Once the graph is created, its 
`setup` method is called with <config>.

#### `<Graph object>.setStyle(<Style object>)`

Set the styling of the graph. Refer to docs on `grafar.Style` for further 
details.The styles of children objects are updated accordingly. Returns 
a reference to the target Graph object.

#### `<Graph object>.setHiding(<boolean>)`

Show / hide the graph (pass `true` to hide, `false` to show). The visibility 
of children objects is updated accordingly. Returns a reference to the target 
Graph object.

#### `<Graph object>.setPanel(<Panel object>)`

Display the graph on the Panel specified. Also moves all the children graphs 
with no explicitly set Panel to this Panel. Returns a reference to the target 
Graph object.

#### `<Graph object>.setParent(<Graph object>)`

Make some other graph the parent of the one on which the method is called.
The properties of the graph are then updated accordingly. You `can` make
graph inherit from itself, but it would not be fun, I promise. Returns a 
reference to the target Graph object.

#### `<Graph object>.setup({parent: .., panel: .., style: .., hide: ...})`

Just a shortened syntax for setting several properties of a Graph at once.
Returns a reference to the target Graph object, as usual.

#### `<Graph object>.dataInterface()`

Exposes the WebGL buffers of the graph. In a later section you would see 
how this can be used for binding a graph to a data generator. Returns 
a data interface object, *not* the Graph. THe structure of such an object 
is similar to
```javascript
{
	buffers: {
		index: .., // edges: [v_1_start, v_1_end, v_2_start, v_2_end...]
		vertex: ... // interleaved: [y,z,x, y,z,x...]
	},
	update: function() {...}
}
```
A buffer is, well, a resizeable buffer:
```javascript
{
	array: <TypedArray>, // read-only
	length: <number>
}
``` 
Typically you wouldn't want to set these manually, but if you just feel like
doing something crazy, check out any of the Graph examples. In order for 
changes to take place, call update.

### Managing styles.

A Style is an object which stores the palette, from which the colours for 
the graphs are drawn. It is not that amazing right now, but I'm planning
on updating it soon. If several graphs share a single Style, they would
be displayed in distinct colours from the style's palette. If the palette
is updated, the colours of the graphs that have already been issued 
(you set the style of the graph first, updated the style next) remain
unchanged.

#### `new grafar.Style([{paletteSize: <number>}])`

Creates a new style object. The palette consists of paletteSize (or 10 by 
default) distinct (but possibly very similar, which I do regret) colours.

#### `<Style object>.samplePalette(<number>)`

Resize the palette to a given number of colours. Returns a reference to the
Style object.

#### `<Style object>.setPalette(<Array of colours>)`

Set the palette explicitly. Acceptable formats for colours include:
* Hex number (integer from 0 to 255^3) `0xRRGGBB`;
* RGB colour `rgb(r, g, b)`, `r`, `g` and `b` from 0 to 255;
* HSL colour `hsl(r, g, b)`, I'm not quite sure about the ranges;
* Named colour `red` or `magenta` or whatever.
It basically matches the CSS colours, so check those out.

##Programming in grafaryaz.

Grafaryaz is a declarative language developed specifically for approximating 
continuous mathematical objects. The target object is described with a set 
of equations and inequalities. It is a very complicated system still in active 
development, so a myriad of bugs is probably present in it. Beware and feel 
free to drop me an e-mail at v.klepov@gmail.com in case anything goes wrong.

* Acceptable variable and function names include anything that would do in 
a conventional programming language. Please, do not use the underscore `_` and 
the dollar mark `$`. Reserved names include `delta` and all the standard 
function names.
* Standard functions include sin, cos, sqrt, exp, abs, log, pow(<base>, <exponent>) 
can also be written as <base>^<exp>
* Comparison operators are `==` (equals), `<=` and '>=' and `@=` for inclusion 
(as in `x @= [1, 3]`).
* Statements are joined into a system with an ampersand `&`.
* A custom function can be defined as follows: `<f_id>(<id_1>, .., <id_n>) == ...`,
and then invoked inside an expression as `<f_id>(<value_1>, .., <value_n>)` or 
`<f_id>(<id_a1>, .., <id_an)`. Let me make this even clearer. You can call a
function with explicit argument values, as in `f(1, 2)`; you can make a substitution
as in `f(x, y) == x * y & z = f(s, d)`, you can mix the two for partial
application (`s == 1 & f(x, y) == x * y & d = f(2, s)`). But you *can not*
call a function on expressions as in `f(x+2, 1)`. If you really want to do it, 
consider something like `x_alt == x+2 & z == f(x_alt, 1)`.
* You can get a partial derivative of a function as follows:
`delta_<f_id>_<var_id>`. Applying this operator does not affect the ordering
of the variables.

This intro was far far from comprehensive, so to get a better idea of what to do you
might want to take a look on `grafaryaz_basics.html`.

## Binding graphs with data generators

So far we've covered the Graphs, which are used for displaying your data, and the
basic grafaryaz programs for telling the program exactly what data you want. 
Here is how they can work together. No updates have been implemented at this stage,
but I'm planning to add them anytime soon.

### `new grafaryaz.Context()`.

Creates a grafaryaz parser.

### `grafar.bind(<data interface object>, <Context object>)`

Any data that is generated by a context is displayed in a graph which has 
issued the data interface. One context can be shared by different graphs, but 
not vice versa.

### `<Context object>.set(<string>)`

The program passed inside a string is executed inside the context, the
result is displayed by the bound graphs.
