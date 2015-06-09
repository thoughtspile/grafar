md build
cd build

set target=grafar.js
set temp=temp.js
copy nul %target% /y
	
set srcList=..\src\grafar.js+^
..\src\math\polyfills.js+^
..\src\core\fn_utils.js+^
..\src\math\misc.js+^
..\src\core\pool.js+^
..\src\math\set.js+^
..\src\math\vector.js+^
..\src\math\numerics.js+^
..\src\math\array_utils.js+^
..\src\core\style.js+^
..\src\math\graphdata.js+^
..\src\core\parser_alt.js+^
..\src\core\reactive.js+^
..\src\core\glutils.js+^
..\src\core\reactive_topo.js+^
..\src\core\reactive_graph.js+^
..\src\core\reactive_object.js+^
..\src\core\parser_.js+^
..\src\core\panel.js+^
..\src\legacy\observer.js+^
..\src\core\animation.js+^
..\src\legacy\grafar_samples.js+^
..\src\legacy\grafar_ui.js
echo %srcList%
copy /b %srcList% %temp%

copy /b ..\libs\i-color.min.js+^
..\libs\three.min.js+^
..\libs\Detector.js+^
..\libs\OrbitControls.js+^
..\libs\stats.min.js+^
%temp% %target%

cd ../

PAUSE