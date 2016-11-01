import { makeID } from './utils';

const UI = {
    push(mockup, parent) {
        var id = mockup.id || makeID(this),
            type = mockup.type,
            col = mockup.col,
            init = mockup.init,
            bind = mockup.bind,
            temp;

        if (type === 'label')
            temp = Label(init);
        else if (type === 'br')
            temp = document.createElement('br');
        else if (type === 'select')
            temp = Select(init);
        else if (type === 'checkbox')
            temp = Checkbox(init);
        else if (type === 'number')
            temp = NumberInput(init, mockup.step);
        else if (type === 'range')
            temp = RangeInput(init, bind, mockup.min, mockup.max, 1);
        else if (type === 'vector')
            temp = VectorInput(init, bind);
        else if (type === 'text')
            temp = TextInput(init);
        else if (type === 'group')
            temp = Group(init);

        parent.appendChild(temp);
        if (col) temp.style.background = col;
        if (bind) temp.addEventListener('change', bind);
        this[id] = temp;
        temp.id = id;

        return UI;
    },

    hide(id) {
        if (this[id]) {
            this[id].style.display = 'none';
        }
        return UI;
    },

    show(id) {
        if (this[id]) {
            this[id].style.display = 'block';
        }
        return UI;
    },

    remove(id) {
        if (this[id]) {
            this[id].parentNode.removeChild(this[id]);
            while (this[id].firstChild) {
                if (this[id].firstChild.id) {
                    UI.remove(this[id].firstChild.id);
                } else {
                    this[id].removeChild(this[id].firstChild);
                }
            }
            this[id] = null;
        }
        return UI;
    }
};

// field constructors
function NumberInput(val, step) {
    step = step || .03;
    var temp = document.createElement('input');
    temp.className = 'num';
    temp.size = 4;
    temp.type = 'number';
    temp.value = val;
    temp.step = step;
    temp.onkeypress = function(key) {
        if (key.keyCode === 40) {
            temp.value = `${ parseFloat(temp.value) - step }`;
            triggerEvent('change', temp);
        } else if (key.keyCode === 38) {
            temp.value = (parseFloat(temp.value) + step).toFixed(2);
            triggerEvent('change', temp);
        }
    };
    Object.defineProperty(temp, 'val', {
        get() {
            return parseFloat(this.value);
        }
    });
    return temp;
};

function RangeInput(val, bind, min, max, step) {
    var wrapper = document.createElement('div'),
        valwrapper = document.createElement('div'),
        valcont = document.createElement('span'),
        temp = document.createElement('input'),
        step = step || 0.01;
    temp.type = 'range';
    temp.value = val;
    temp.min = min;
    temp.max = max;
    temp.step = step;
    temp.onmousemove = function(evt) {
        triggerEvent('change', temp);
    };
    if (bind) temp.addEventListener('change', bind);
    Object.defineProperty(wrapper, 'val', {
        get() {
            return parseFloat(temp.value);
        }
    });

    var tempwidth = parseInt(window.getComputedStyle(temp).width),
        tempstep = tempwidth / (parseFloat(max) - parseFloat(min));
    const showValue = function() {
        var val = parseFloat(temp.value);
        valcont.innerHTML = val.toFixed(1);
        valcont.style.left = ((val - parseFloat(min)) * tempstep -
            12 * (val - parseFloat(min)) / (parseFloat(max) - parseFloat(min)) + 6) + 'px';
    };

    temp.addEventListener('change', showValue);
    showValue();

    valcont.style.position = 'relative';
    valcont.style.display = 'inline-block';
    valcont.style.transform = 'translateX(-50%)';
    valwrapper.appendChild(valcont);
    wrapper.appendChild(valwrapper);
    wrapper.appendChild(temp);
    wrapper.style.position = 'relative';
    return wrapper;
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
    Object.defineProperty(temp, 'val', {
        get() {
            return inputReference.map(function(e) {return parseFloat(e.value)});
        }
    });
    return temp;
}

function TextInput(text) {
    var temp = document.createElement('input');
    temp.type = 'text';
    temp.value = text;
    return temp;
}

function Group(elements) {
    var temp = document.createElement('ul');
    temp.className = 'grafar_ui_subpanel';
    for (var j = 0; j < elements.length; j++) {
        UI.push(elements[j], temp);
    }
    return temp;
}

function Label(val) {
    var temp = document.createElement('span');
    temp.className = 'grafar_ui_label';
    temp.appendChild(document.createTextNode(val));
    Object.defineProperty(temp, 'val', {
        set(newText) {
            this.nodeValue = newText;
        }
    });
    return temp;
}

function Select(options) {
    var temp = document.createElement('select');
    for (var j = 0; j < options.length; j++)
        temp.options[j] = new Option(options[j]);
    Object.defineProperty(temp, 'val', {
        get() {
            return this.selectedIndex;
        }
    });
    return temp;
}

function Checkbox(val) {
    var temp = document.createElement('input');
    temp.type = 'checkbox';
    temp.checked = val;
    Object.defineProperty(temp, 'val', {
        get() {
            return this.checked;
        }
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

export {UI};
