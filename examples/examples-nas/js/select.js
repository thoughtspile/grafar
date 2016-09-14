var eulerface = eulerface || {};

eulerface.lockScroll = function() {
	document.body.style.overflow = 'hidden';
	document.getElementsByTagName('html')[0].style['overflow-y'] = 'scroll';
};

eulerface.unlockScroll = function() {		
	document.body.style.overflow = 'auto';
	document.getElementsByTagName('html')[0].style['overflow-y'] = 'hidden';
};


eulerface.Select = function(field, preprocess) {
	preprocess = preprocess || function (value, node) {
		var div = document.createElement('div');
		div.innerHTML = node.innerHTML;
		return div;
	};
	
	var pseudoSelect = document.createElement('div');
	field.parentNode.replaceChild(pseudoSelect, field);
	pseudoSelect.setAttribute('id', field.getAttribute('id'));
	pseudoSelect.className = field.className + ' selectContainer';
	
	var activeSelect = document.createElement('div');
	activeSelect.className = 'activeSelect option';
	pseudoSelect.appendChild(activeSelect);
	
	var dropBtn = document.createElement('div'),
		arrow = document.createElement('div');
	arrow.className = 'arrow-down';
	dropBtn.appendChild(arrow);
	pseudoSelect.appendChild(dropBtn);
	dropBtn.className = 'dropper';
	dropBtn.addEventListener('click', function() {
		if (window.getComputedStyle(dropDown).visibility === 'hidden')
			dropDown.style.visibility = 'visible';
		else
			dropDown.style.visibility = 'hidden';
		var pos = pseudoSelect.getBoundingClientRect();
		//var availHeight = window.innerHeight - pos.bottom,
		//	selfHeight = pos.bottom - pos.top;
		//dropDown.style.height = Math.min(availHeight, selfHeight) + 'px';
	});
	
	var dropDown = document.createElement('div');
	dropDown.className = 'dropDown';
	pseudoSelect.appendChild(dropDown);

	dropDown.addEventListener('mouseover', eulerface.lockScroll);
	dropDown.addEventListener('mouseout', eulerface.unlockScroll);
		
	this.options = dropDown;
	this.container = pseudoSelect;
	this.active = activeSelect;
    
	var oldOptions = field.children;
	for (var i = 0; i < oldOptions.length; i++) {
		var value = oldOptions[i].getAttribute('value');
		this.addOption(preprocess(value, oldOptions[i]), value);
	}
}

eulerface.Select.prototype.addOption = function(node, value) {
	node.setAttribute('value', value);
	node.className += 'option';
	node.addEventListener('click', this.setActiveOption.bind(this, node));
	this.options.appendChild(node);
	if (this.options.children.length === 1)
		this.setActiveOption(node);
	return this;
}

eulerface.Select.prototype.setActiveOption = function(el) {
	this.options.style.visibility = 'hidden';
	//if (this.active.children.length !== 0)
	//	this.options.appendChild(this.active.firstChild);
	//this.active.appendChild(el);
	this.container.setAttribute('value', el.getAttribute('value'));
    
    this.options.removeChild(el);
    if (this.active.firstChild)
        this.options.appendChild(this.active.firstChild);
	this.active.appendChild(el);
    
	eulerface.unlockScroll();
	if ("createEvent" in document) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("change", false, true);
		this.container.dispatchEvent(evt);
	} else {
		this.container.fireEvent("onchange");
	}
}