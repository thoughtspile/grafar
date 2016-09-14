(function(global) {
	var mathMVC = {
		origin: {x: 0, y: 0},
		coeff: 100,
		target: null,
		mouseDown: false,
		models: {},
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
		mathMVC.models[mathMVC.activeId] = String((Number(mathMVC.models[mathMVC.activeId]) + change).toFixed(2));
		mathMVC.target.innerHTML = mathMVC.models.variables[mathMVC.activeId];
	};
	
	mathMVC.drop = function(callback) {
		document.removeEventListener('mousemove', mathMVC.drag);
		document.removeEventListener('mousemove', callback);
		document.addEventListener('mouseup', mathMVC.drop);
	};
		
	
	mathMVC.resolveControls = function(tex) {		
		if (/\\control/.test(tex)) {
			return tex.replace(
				/\\control{([a-zA-Z0-9\-_]+)}{([-+]?[0-9]*\.?[0-9]*)}/g, 
				function(match, id, init) {
					mathMVC.models[id] = String(init);
					return '\\class{mmvce}{\\cssId{' + id + '}{' + init + '}}';
				}
			);
		} else {
			return tex;
		}
	};
	
	
	mathMVC.select = function(id, field, divs, models, callback) {
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
			var availHeight = window.innerHeight - pos.bottom,
				selfHeight = pos.bottom - pos.top;
			dropDown.style.height = Math.min(availHeight, selfHeight) + 'px';
		});
		
		// add the options container
		var dropDown = document.createElement('div');
		dropDown.className = 'dropDown';
		field.appendChild(dropDown);

		// prevent window scroll
		dropDown.addEventListener('mouseover', mathMVC.lockScroll);
		dropDown.addEventListener('mouseout', mathMVC.unlockScroll);
		
		// append divs
		var activeIndex = 0,
			optionListener = function(i) {
				if (activeIndex === i)
					return;
				mathMVC.models[id] = models[i];
				dropDown.style.visibility = 'hidden';
				dropDown.appendChild(activeSelect.firstChild);
				activeSelect.appendChild(divs[i]);
				activeIndex = i;
				mathMVC.unlockScroll();
				callback();
			};
		divs.forEach(function(div, i) {
			dropDown.appendChild(div);
			div.addEventListener('click', optionListener.bind(null, i));
		});
		
		// default choice
		console.log('hi', id, mathMVC.models);
		mathMVC.models[id] = models[0];
		activeSelect.appendChild(divs[0]);
	};
	
	mathMVC.div = function(tex, callback) {
		var option = document.createElement('div');			
		option.innerHTML = mathMVC.resolveControls(tex);
		option.className = 'option';
		return option;
	};
		
	
	mathMVC.bind = function(callback) {
		var fields = document.getElementsByClassName('mmvce');
		for (var i = 0; i < fields.length; i++)
			fields[i].addEventListener('mousedown', mathMVC.startDrag(callback));
	};
	
	
	mathMVC.addModel = function(model, id) {
		mathMVC.models[id] = model;
		return mathMVC;
	};
	
	mathMVC.getModelById = function(id) {
		console.log(id, mathMVC.models, mathMVC.models[id]);
		return mathMVC.models[id].replace(/\$([a-zA-Z0-9\-_]+)/g, 
			function(dummy, id) {
				return mathMVC.getModelById(id);
			});
	};
	
	
	mathMVC.setSubVisuals = function() {
		var subVisuals = document.getElementsByClassName('subVisual');
		if (subVisuals.length === 0)
			return;
		var staticWidth = window.getComputedStyle(subVisuals[0]).width;
		//for (var i = 0; i < subVisuals.length; i++)
		//	subVisuals[i].style.height = staticWidth;
	};
	
	mathMVC.setSubVisuals();
	
	global.eulerface = mathMVC;
}(this))