(function(global) {
	var mathMVC = {
		origin: {x: 0, y: 0},
		coeff: 100,
		target: null,
		mouseDown: false,
		variables: {},
		activeModel: [],
		activeId: null
	};
	
	
	mathMVC.updatePosition = function(event) {
		this.origin.x = event.clientX;
		this.origin.y = event.clientY;
	};
	
	mathMVC.startDrag = function(event) {
		event.preventDefault();
		var target = event.toElement || event.target;
		while (!/mmvce/.test(target.className))
			target = target.parentNode;
		mathMVC.activeId = target.id;
		mathMVC.target = (target.childElementCount === 2? target.lastChild: target);
		mathMVC.updatePosition(event);
		document.addEventListener('mousemove', mathMVC.drag);
		document.addEventListener('mouseup', mathMVC.drop);
	};
	
	mathMVC.drag = function(event) {
		var change = ((event.clientX - mathMVC.origin.x) + (mathMVC.origin.y - event.clientY))/ mathMVC.coeff;
		mathMVC.updatePosition(event);
		mathMVC.variables[mathMVC.activeId] += change;
		mathMVC.target.innerHTML = mathMVC.variables[mathMVC.activeId].toFixed(2);
	};
	
	mathMVC.drop = function() {
		document.removeEventListener('mousemove', mathMVC.drag);
		document.addEventListener('mouseup', mathMVC.drop);
	};
	
	
	mathMVC.select = function(field, items) {
		items.forEach(function(item) {
			field.appendChild(item);
		});
	};
	
	mathMVC.div = function(equations) {
		var option = document.createElement('div'),
			finalTex = '\\(\\left \\{ \\begin{array}{lcl}',
			model = [];
		
		equations.forEach(function(line) {
			finalTex += mathMVC.process(line, model) + '\\\\';
		});
		
		//mathMVC.models.push(model);
		finalTex += '\\end{array} \\right. \\)';
		option.innerHTML = finalTex;
		option.className = 'option';
		option.addEventListener('click', function() {
			mathMVC.activeModel = model;
		});
		
		return option;
	};
	
	mathMVC.process = function(lineModel, model) {
		if (/\\control/.test(lineModel.tex)) {
			model.push(function() {
				return lineModel.plain.replace(/\$([a-zA-Z]+)/g, function(dummy, id) {
					return mathMVC.variables[id];
				});
			});
			return lineModel.tex.replace(
				/\\control{([a-zA-Z]+)}{([-+]?[0-9]*\.?[0-9]*)}/g, 
				function(match, id, init) {
					mathMVC.variables[id] = Number(init);
					return '\\class{mmvce}{\\cssId{' + id + '}{' + init + '}}';
				}
			);
		} else {
			model.push(function() { return lineModel.plain; });
			return lineModel.tex;
		}
	};
	
	
	mathMVC.bind = function() {
		Object.keys(mathMVC.variables).forEach(function(id) {
			var field = document.getElementById(id);
			if (field) field.addEventListener('mousedown', mathMVC.startDrag);
		});
	};
	
	
	mathMVC.getModel = function() {
		return mathMVC.activeModel.map(function(f) { return f(); });
	};
	
	
	global.mathMVC = mathMVC;
}(this))