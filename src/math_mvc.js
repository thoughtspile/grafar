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
	
	mathMVC.startDrag = function(callback) {
		return function(event) {
			event.preventDefault();
			var target = event.toElement || event.target;
			while (!/mmvce/.test(target.className))
				target = target.parentNode;
			mathMVC.activeId = target.id;
			mathMVC.target = (target.childElementCount === 2? target.lastChild: target);
			mathMVC.updatePosition(event);
			document.addEventListener('mousemove', mathMVC.drag);
			document.addEventListener('mousemove', callback);
			document.addEventListener('mouseup', mathMVC.drop.bind(null, callback));
		};
	};
	
	mathMVC.drag = function(event) {
		var change = ((event.clientX - mathMVC.origin.x) + (mathMVC.origin.y - event.clientY))/ mathMVC.coeff;
		mathMVC.updatePosition(event);
		mathMVC.variables[mathMVC.activeId] += change;
		mathMVC.target.innerHTML = mathMVC.variables[mathMVC.activeId].toFixed(2);
	};
	
	mathMVC.drop = function(callback) {
		document.removeEventListener('mousemove', mathMVC.drag);
		document.removeEventListener('mousemove', callback);
		document.addEventListener('mouseup', mathMVC.drop);
	};
	
	
	mathMVC.select = function(field, divs, models, callback) {
		for (var i = 0; i < divs.length; i++) {
			field.appendChild(divs[i]);
			(function() {
				var model = models[i];
				divs[i].addEventListener('click', function() {
					mathMVC.activeModel = model;
					callback();
				});
			}());
		};
	};
	
	mathMVC.div = function(tex, callback) {
		var option = document.createElement('div'),
			finalTex = '\\(\\left \\{ \\begin{array}{lcl}';
		
		tex.forEach(function(line) {
			finalTex += mathMVC.process(line) + '\\\\';
		});
		
		finalTex += '\\end{array} \\right. \\)';
		option.innerHTML = finalTex;
		option.className = 'option';
		
		return option;
	};
	
	mathMVC.addModel = function(model) {
		return model.map(function(strModel) {
			// static short-circuit
			return function() {
				return strModel.replace(/\$([a-zA-Z]+)/g, function(dummy, id) {
					return mathMVC.variables[id];
				});
			};
		});
	};
		
	mathMVC.process = function(tex) {
		if (/\\control/.test(tex)) {
			return tex.replace(
				/\\control{([a-zA-Z]+)}{([-+]?[0-9]*\.?[0-9]*)}/g, 
				function(match, id, init) {
					mathMVC.variables[id] = Number(init);
					return '\\class{mmvce}{\\cssId{' + id + '}{' + init + '}}';
				}
			);
		} else {
			return tex;
		}
	};
	
	
	mathMVC.bind = function(callback) {
		Object.keys(mathMVC.variables).forEach(function(id) {
			var field = document.getElementById(id);
			if (field) 
				field.addEventListener('mousedown', mathMVC.startDrag(callback));
		});
	};
	
	
	mathMVC.getModel = function() {
		return mathMVC.activeModel.map(function(f) { return f(); });
	};
	
	
	global.mathMVC = mathMVC;
}(this))