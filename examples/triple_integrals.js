runGrafar(function() {
	grafar.config.debug = false;
	
	var maxHelpers = Math.max.apply(null, problems.map(function(p) {return p.model.length;})),
		activeHelpers = 0;
	
	grafar.ui([
		{type: 'select', id: 'dim', init: ['x', 'y', 'z'], bind: updateSection},
		{type: 'label', init: ' = '},
		{type: 'number', id: 'val', init: 0, bind: updateSection},
		{type: 'br'},
		{type: 'checkbox', id: 'helpers', bind: plotArea},
		{type: 'label', init: ' Показать поверхности'}
	], {container: 'options'});
	
	//document.getElementById('sectionControl').appendChild(
		//mathMVC.div('\\control{sectVarName}{x} = \\control{sectValue}{0}')
	//);
	//mathMVC.addModel('$sectVarName == $sectValue');
	
	mathMVC.select(
		'volume',
		document.getElementById('volumeSelect'),
		problems.map(function(pr) {return mathMVC.div(pr.tex)}),
		problems.map(function(pr) {return pr.model.join('&'); }),
		updateProblem
	);
	MathJax.Hub.Queue(
		['Typeset', MathJax.Hub],
		[mathMVC.bind, updateProblem],
		[updateProblem]
	);
	
	
	var pan3d = new grafar.Panel(document.getElementById('plot3d')),
		pan2d = new grafar.Panel(document.getElementById('plot2d')),
		helpers2d = [], 
		helpers3d = [];
	for (var i = 0; i < maxHelpers; i++) {
		helpers2d.push(new grafar.Object().pin(pan2d));
		helpers3d.push(new grafar.Object().pin(pan3d));
	}
	
	var area = new grafar.Object().pin(pan3d),
		section = new grafar.Object().pin(pan3d),//.pin(pan2d);
		section2 = new grafar.Object().pin(pan2d);//.pin(pan2d);
	
	var problem;
	//updateProblem();
	
	function updateProblem() {
		problem = mathMVC.getModelById('volume');
		//console.log(problem);
		
		activeHelpers = problem.split('&').length;
		for (var i = 0; i < activeHelpers; i++) {
		//	helpers3d[i].constrain({what: 'x, y, z', maxlen: 12000, as: grafar.ductParse(problem[i])}).refresh();
		};
		for ( ; i < maxHelpers; i++) {
		//	helpers3d[i].hide(true);
		//	helpers2d[i].hide(true);
		};
		area.constrain({what: 'x, y, z', maxlen: 15000, as: grafar.ductParse(problem)}).refresh();
		
		plotArea();
		updateSection();
	}
	
	function plotArea() {
		for (var i = 0; i < activeHelpers; i++) {
			helpers3d[i].hide(!grafar.UI.helpers.val);
			helpers2d[i].hide(!grafar.UI.helpers.val);
		}
	}
	
	function updateSection() {
		var dim = grafar.UI.dim.val,
			targetvar = ['x', 'y', 'z'][dim],
			height = grafar.UI.val.val,
			sector = '&' + targetvar + '==' + height;
			
		pan2d.setAxes(grafar.setpop(['x', 'y', 'z'], targetvar));
		section.constrain({what: 'x, y, z', maxlen: 5000, as: grafar.ductParse(problem + sector)}).refresh();
		section2.constrain({what: 'x, y, z', maxlen: 5000, as: grafar.ductParse(problem + sector)}).refresh();
		for (var i = 0; i < activeHelpers; i++)
			helpers2d[i].constrain({what: 'x, y, z', maxlen: 5000, as: grafar.ductParse(problem[i] + sector)}).refresh();
	}
}, '../');