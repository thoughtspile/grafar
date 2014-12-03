md build
cd build

set target=grafar.js
copy nul %target% /y
	
set srcList=..\src\grafar.js+^
..\src\math\polyfills.js+^
..\src\math\misc.js+^
..\src\core\observer.js+^
..\src\core\pool.js+^
..\src\math\set.js+^
..\src\math\vector.js+^
..\src\math\numerics.js+^
..\src\math\graphdata.js+^
..\src\core\style.js+^
..\src\core\table.js+^
..\src\core\database.js+^
..\src\core\object.js+^
..\src\generators\gen_interface.js+^
..\src\generators\grafaryaz\planner.js+^
..\src\generators\grafaryaz\parser.js+^
..\src\generators\grafaryaz\parser_.js+^
..\src\generators\grafaryaz\context.js+^
..\src\core\animation.js+^
..\src\core\panel.js+^
..\src\core\graph.js+^
..\src\legacy\grafar_samples.js+^
..\src\legacy\grafar_ui.js
echo %srcList%
copy /b %srcList% %target%

cd ../