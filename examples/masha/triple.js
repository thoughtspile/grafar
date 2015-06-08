(function() {
    runGrafar(function() {
        grafar.config.debug = false;
        function getProblemById(id) {
            return problems.filter(function(pr) {
                return pr.id === id;
            })[0];
        };	
        
        var infoDiv = document.getElementById('info');
        problems.forEach(function(pr) {
            pr.div = document.createElement('div');
            pr.div.innerHTML = pr.info;
        });
        
        var maxHelpers = Math.max.apply(null, problems.map(function(p) {return p.eqns.length;})),
            activeHelpers = 0;
        
        grafar.ui([
            {type: 'select', id: 'dim', init: ['x', 'y', 'z'], bind: updateSection},
            {type: 'label', init: ' = '},
            {type: 'number', id: 'val', init: 0, bind: updateSection},
            {type: 'br'},
            {type: 'checkbox', id: 'helpers', bind: plotArea},
            {type: 'label', init: 'Показать исходные ограничения'}
        ], {container: 'options'});
        
        var pan3d = new grafar.Panel(document.getElementById('plot3d')),
            pan2d = new grafar.Panel(document.getElementById('plot2d'));
        
        var helpers2d = [], 
            helpers3d = [];
        for (var i = 0; i < maxHelpers; i++) {
            helpers2d.push(new grafar.Object().pin(pan2d));
            helpers3d.push(new grafar.Object().pin(pan3d));
        }
        
        var area = new grafar.Object().pin(pan3d),
            section = new grafar.Object().pin(pan3d),
            section2 = new grafar.Object().pin(pan2d);
        
        var problem;
        updateProblem()
        
        function updateProblem() {
            problem = getProblemById('65-3-a');			
			var problemId = '65-3-a';
			
            if (infoDiv.children.length !== 0)
                infoDiv.removeChild(infoDiv.firstChild);
            infoDiv.appendChild(problem.div);
            if (grafar.isExisty(window.MathJax))
                MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
            
            activeHelpers = problem.eqns.length;
            for (var i = 0; i < activeHelpers; i++) {
                helpers3d[i].constrain({
                    what: 'x, y, z', 
                    maxlen: 12000, 
                    as: grafar.ductParse(problem.eqns[i], problem.cube)
                });
            };
            for ( ; i < maxHelpers; i++) {
                helpers3d[i].hide(true);
                helpers2d[i].hide(true);
            };
            area.constrain({
                what: 'x, y, z', 
                maxlen: 15000, 
                as: grafar.ductParse(problem.eqns.join('&'), problem.cube)
            }).refresh();
            console.log('hi');
            //plotArea();
            //updateSection();
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
            section.constrain({
                what: 'x, y, z', 
                maxlen: 5000, 
                as: grafar.ductParse(problem.eqns.join('&') + sector, problem.cube)
            });
            section2.constrain({
                what: 'x, y, z', 
                maxlen: 5000, 
                as: grafar.ductParse(problem.eqns.join('&') + sector, problem.cube)
            });
            for (var i = 0; i < activeHelpers; i++)
                helpers2d[i].constrain({
                    what: 'x, y, z', 
                    maxlen: 5000, 
                    as: grafar.ductParse(problem.eqns[i] + sector, problem.cube)
                });
        }
        
        hideAllBut = function(container, visible) {
            var children = container.children;
            for (var i = 0; i < children.length; i++)
              children[i].style.display = 'none';
            visible.style.display = 'block';
        };
		
		//sel1 = new eulerface.Select(document.getElementById('sel1')),
		
        //sel1.container.addEventListener('change', updateProblem);

		//sel1.addOption(document.getElementById('opt-65-3-a'), '65-3-a');
		//sel1.addOption(document.getElementById('opt-65-3-b'), '65-3-b');
		//sel1.addOption(document.getElementById('opt-65-3-v'), '65-3-v');
	
        
        //MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
    }, '../../');
}());