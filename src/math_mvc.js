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
		// make field into pseudo-select
		field.className += 'selectContainer';
		
		// add active display
		var activeSelect = document.createElement('div');
		activeSelect.className = 'activeSelect';
		field.appendChild(activeSelect);
		
		// add drop button
		var dropper = document.createElement('div'),
			arrow = document.createElement('div');
		arrow.className = 'arrow-down';
		dropper.appendChild(arrow);
		field.appendChild(dropper);
		dropper.className = 'dropper';
		dropper.addEventListener('click', function() {
			var style = window.getComputedStyle(dropDown);
			//console.log('select fired');
			if (style.visibility === 'hidden')
				dropDown.style.visibility = 'visible';
			else
				dropDown.style.visibility = 'hidden';
			var pos = field.getBoundingClientRect();
			dropDown.style.left = Math.floor(pos.left) + 'px';
			dropDown.style.top = Math.floor(pos.bottom) + 'px';
			dropDown.style.width = Math.floor(pos.right - pos.left) + 'px';
			dropDown.style.height = window.innerHeight - Math.floor(pos.bottom) + 'px';
		});
		
		// add the options container
		var dropDown = document.createElement('div');
		dropDown.className = 'dropDown';
		document.body.appendChild(dropDown);

		// prevent window scroll
		dropDown.addEventListener('mouseover', function(e) {
			document.body.style.overflow = 'hidden';
			document.getElementsByTagName('html')[0].style['overflow-y'] = 'scroll';
		});
		dropDown.addEventListener('mouseout', function(e) {
			document.body.style.overflow = 'auto';
			document.getElementsByTagName('html')[0].style['overflow-y'] = 'hidden';
		});
		
		// append divs
		var activeIndex = 0,
			optionListener = function(i) {
				//console.log('option choice fired');
				if (activeIndex === i)
					return;
				//console.log('option choice confirmed');
				mathMVC.activeModel = models[i];
				dropDown.style.visibility = 'hidden';
				dropDown.appendChild(activeSelect.firstChild);
				activeSelect.appendChild(divs[i]);
				activeIndex = i;
				callback();
			};
		divs.forEach(function(div, i) {
			dropDown.appendChild(div);
			div.addEventListener('click', optionListener.bind(null, i));
		});
		
		// default choice
		mathMVC.activeModel = models[0];
		activeSelect.appendChild(divs[0]);
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