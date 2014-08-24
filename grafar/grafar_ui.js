(function(global) {
	var _G = global.grafar || (global.grafar = {});
	
	_G.UI = {};
		
	// grafar-chainable constructor
	_G.ui = function(mockup, opts) {
		opts = opts || {};
		var container = opts.container || document;
		if (typeof(container) === 'string')
			container = document.getElementById(container);
		if (mockup instanceof Array)
			mockup = {init: mockup, type: 'group'};
		
		this.UI.push(mockup, container);
		
		return this;
	};
	
	// methods
	_G.UI.push = function(mockup, parent) {
		var id = mockup.id || _G.makeID(this),
			type = mockup.type,
			col = mockup.col,
			init = mockup.init,
			bind = mockup.bind,
			temp;
		
		if (type === 'label')
			temp = new Label(init);
		else if (type === 'br')
			temp = document.createElement('br');
		else if (type === 'select')
			temp = new Select(init);
		else if (type === 'checkbox')
			temp = new Checkbox(init);
		else if (type === 'number')
			temp = new NumberInput(init, mockup.step);
		else if (type === 'vector')
			temp = new VectorInput(init, bind);
		else if (type === 'text')
			temp = new TextInput(init);
		else if (type === 'group')
			temp = new Group(init);
			
		parent.appendChild(temp);
		if (col) temp.style.background = col;
		if (bind) temp.addEventListener('change', bind);
		this[id] = temp;
		temp.id = id;
		
		return _G.UI;
	}
		
	_G.UI.hide = function(id) {
		if (this[id])
			this[id].style.display = 'none';
		return _G.UI;
	}
	
	_G.UI.show = function(id) {
		if (this[id])
			this[id].style.display = 'block';
		return _G.UI;
	}
	
	_G.UI.remove = function(id) {
		if (this[id]) {
			this[id].parentNode.removeChild(this[id]);
			while (this[id].firstChild)
				if (this[id].firstChild.id)
					_G.UI.remove(this[id].firstChild.id);
				else
					this[id].removeChild(this[id].firstChild);
			this[id] = null;
		}
		return _G.UI;
	}
		
	// field constructors
	function NumberInput(val, step) {
		step = step || .03;
		var temp = document.createElement('input');		
		temp.className = 'num';
		temp.size = '4';
		temp.type = 'number';
		temp.value = val;
		temp.step = step;
		temp.onkeypress = function(key) {
			if (key.keyCode === 40) {
				temp.value = parseFloat(temp.value) - step;
				triggerEvent('change', temp);
			} else if (key.keyCode === 38) {
				temp.value = (parseFloat(temp.value) + step).toFixed(2);
				triggerEvent('change', temp);
			}
		};
		temp.__defineGetter__('val', function() {
			return parseFloat(this.value);
		});
		return temp;
	};
	
	function VectorInput(values, bind) {
		var temp = document.createElement('div'),
		    inputReference = [];
		temp.style['display'] = 'inline';
		temp.appendChild(document.createTextNode('('));
		for (var j = 0; j < values.length; j++) {
			if (j)
				temp.appendChild(document.createTextNode(', '));
			var temp2 = NumberInput(values[j], .03);
			if (bind)
				temp2.addEventListener('change', bind);
			temp.appendChild(temp2);
			inputReference.push(temp2);
		}
		temp.appendChild(document.createTextNode(')'));
		temp.__defineGetter__('val', function() {
			return inputReference.map(function(e) {return parseFloat(e.value)});
		});
		return temp;
	}
	
	function TextInput(text) {
		var temp = document.createElement('input');
		temp.type = 'text';
		temp.value = init;
		return temp;
	}
	
	function Group(elements) {
		var temp = document.createElement('ul');
		temp.className = 'grafar_ui_subpanel';
		for (var j = 0; j < elements.length; j++)
			_G.UI.push(elements[j], temp);
		return temp;
	}
	
	function Label(val) {
		var temp = document.createElement('span');
		temp.className = 'grafar_ui_label';	
		temp.appendChild(document.createTextNode(val));
		temp.__defineSetter__('val', function(newText) {
			this.nodeValue = newText;
		});
		return temp;
	}
	
	function Select(options) {		
		var temp = document.createElement('select');
		for (var j = 0; j < options.length; j++)
			temp.options[j] = new Option(options[j]);
		temp.__defineGetter__('val', function() {
			return this.selectedIndex;
		});
		return temp;
	}
	
	function Checkbox(val) {
		var temp = document.createElement('input');
		temp.type = 'checkbox';
		temp.checked = val;
		temp.__defineGetter__('val', function() {
			return this.checked;
		});
		return temp;
	}
	
	// utilities
	function triggerEvent(type, element) {
		if ('createEvent' in document) {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent(type, false, true);
			element.dispatchEvent(evt);
		} else {
			element.fireEvent('on' + type);
		}
	}
}(this));