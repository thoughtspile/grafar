(function() {
	function get_track(centr, coord) {
		var track;
		if (coord < 0) {
			if(centr < 0) {
    			return Math.abs(coord)- Math.abs(centr);
            }
            return Math.abs(coord)+ Math.abs(centr);
		} else {
			if(centr < 0) {
    			return Math.abs(coord)+ Math.abs(centr);
			} else {
    			return Math.abs(coord)- Math.abs(centr);
            }
		}
	}

    function setColor(threeObj, r, g, b) {
        threeObj.material.color.r = r / 255;
        threeObj.material.color.g = g / 255;
        threeObj.material.color.b = b / 255;
    }


    // UI binding

    var panelMainDiv = document.getElementById('plot3d_main');
	panelMainDiv.addEventListener('mouseover', eulerface.lockScroll);
	panelMainDiv.addEventListener('mouseout', eulerface.unlockScroll);

	document.getElementById('m_blue').addEventListener('change', updateProblem);
	document.getElementById('m_green').addEventListener('change', updateProblem);
	document.getElementById('sl_b').addEventListener('change', updateProblem);
	document.getElementById('sl_g').addEventListener('change', updateProblem);

	grafar.ui([
    	{type: 'checkbox', id: 'animation', bind: animate},
    	{type: 'label', init: 'Анимация'},
    	{type: 'br'}
	], {container: 'options'});


    // Grafar object declaration

	var pan3d_main = new grafar.Panel(document.getElementById('plot3d_main'));
	var obj_1 = new grafar.Object().pin(pan3d_main),
    	c_1 = new grafar.Object().pin(pan3d_main),
    	obj_2 = new grafar.Object().pin(pan3d_main),
    	c_2 = new grafar.Object().pin(pan3d_main),
    	line = new grafar.Object().pin(pan3d_main),
    	centr = new grafar.Object().pin(pan3d_main);

	pan3d_main.camera.position.set(-8, 15, 10);
	pan3d_main.setAxes(['x', 'y', 'z']);

	var r_1,
        r_2,
        С;

	// массив для анимации
	var obj = [];
	for (var i = 0; i < 10; i++) {
    	obj.push(new grafar.Object().pin(pan3d_main));
    }

	updateProblem();

	function updateProblem() {
		var m_1 = parseFloat(document.getElementById('m_blue').value);
    	var m_2 = parseFloat(document.getElementById('m_green').value);

		var obj_1_x = parseFloat(document.getElementById('sl_b').value);
    	var obj_2_x = parseFloat(document.getElementById('sl_g').value);

		r_1 = Math.pow(m_1 / 12, 1 / 3);
		r_2 = Math.pow(m_2 / 12, 1 / 3);
        C = (m_1 * obj_1_x + m_2 * obj_2_x) / (m_1 + m_2);

		document.getElementById('res').disabled = true;
		document.getElementById('res').value =  (1 / Math.abs(m_1) + 1 / Math.abs(m_2)).toFixed(2);
		document.getElementById('cent').disabled = true;
		document.getElementById('cent').value =  C;

		// Первый шарик
		obj_1.constrain(grafar.range(0, 2 * Math.PI, 25, 'phi'));
    	obj_1.constrain(grafar.range(0, Math.PI, 25, 'theta'));

    	obj_1.map('x', 'phi, theta', (phi, theta) => obj_1_x + r_1 * Math.sin(theta) * Math.cos(phi));
    	obj_1.map('y', 'phi, theta', (phi, theta) => r_1 * Math.sin(theta) * Math.sin(phi));
    	obj_1.map('z', 'phi, theta', (phi, theta) => r_1 * Math.cos(theta));

        obj_1.colorize({ using: '', as: grafar.Style.constantColor(0 / 255, 140 / 255, 240 / 255) })
    		.refresh();

		c_1.constrain(grafar.constant(obj_1_x, 'x'));
		c_1.constrain(grafar.constant(0, 'y'));
		c_1.constrain(grafar.constant(0, 'z'));
        c_1.refresh();

		c_1.glinstances[0].object.children[0].visible = true;
		c_1.glinstances[0].object.children[1].visible = false;
		c_1.glinstances[0].object.children[0].material.transparent = false;
		c_1.glinstances[0].object.children[0].material.size = 20;
		setColor(c_1.glinstances[0].object.children[0], 0, 128, 0);

		// Второй шарик
		var phi = obj_2.extern(grafar.range(0, 2 * Math.PI, 25, 'phi'));
    	var theta = obj_2.extern(grafar.range(0, Math.PI, 25, 'theta'));

    	obj_2.map('x', [phi, theta], (phi, theta) => obj_2_x + r_2 * Math.sin(theta) * Math.cos(phi));
    	obj_2.map('y', [phi, theta], (phi, theta) => r_2 * Math.sin(theta) * Math.sin(phi));
    	obj_2.map('z', [phi, theta], (phi, theta) => r_2 * Math.cos(theta));

        obj_2.colorize({ using: '', as: grafar.Style.constantColor(168/255, 228/255, 160/255) })
    		.refresh();

        c_2.constrain(grafar.constant(obj_2_x, 'x'));
		c_2.constrain(grafar.constant(0, 'y'));
		c_2.constrain(grafar.constant(0, 'z'));
        c_2.refresh();

		c_2.glinstances[0].object.children[0].visible = true;
		c_2.glinstances[0].object.children[1].visible = false;
		c_2.glinstances[0].object.children[0].material.transparent = false;
		c_2.glinstances[0].object.children[0].material.size = 20;
		setColor(c_2.glinstances[0].object.children[0], 0, 128, 0);

		// Ось
		line.constrain(grafar.seq(-10, 10, 100, 'x'));
    	line.constrain({what: 'y,z', using: 'x', as: function(data, l) {
				var x = data.x;
				for (var i = 0; i < l; i++) {
					data.y[i]= 0 ;
					data.z[i] = 0;
				}
			}});
    	line.refresh();

		line.glinstances[0].object.children[0].visible = true;
		line.glinstances[0].object.children[0].material.size = 2;
		setColor(line.glinstances[0].object.children[0], 225, 115, 5);
		line.glinstances[0].object.children[0].material.transparent = false;

		// Центр масс
        centr.constrain(grafar.constant(C, 'x'));
		centr.constrain(grafar.constant(0, 'y'));
		centr.constrain(grafar.constant(0, 'z'));
		centr.refresh();

		centr.glinstances[0].object.children[0].visible = true;
		centr.glinstances[0].object.children[1].visible = false;
		centr.glinstances[0].object.children[0].material.transparent = false;
		centr.glinstances[0].object.children[0].material.size = 10;
		setColor(centr.glinstances[0].object.children[0], 225, 115, 5);
	}

    function prepareAnimation() {
    	obj_1_x = parseFloat(document.getElementById('sl_b').value);
    	obj_2_x = parseFloat(document.getElementById('sl_g').value);

    	m_1 = parseFloat(document.getElementById('m_blue').value);
    	m_2 = parseFloat(document.getElementById('m_green').value);

    	C = (m_1 * obj_1_x + m_2 * obj_2_x) / (m_1 + m_2);

        obj_1
            .constrain(grafar.range(0, 2 * Math.PI, 25, 'phi'))
            .constrain(grafar.range(0, Math.PI, 25, 'theta'))
            .constrain({what: 'x, y, z', using: 'phi ,theta, temp', as: function(data, l) {
                var deg = data.temp[0] * 0.0174533;
                var track = get_track(C, obj_1_x);
                var obj_1_mass_x = C + track * Math.cos(deg);
                var obj_1_mass_y = track * Math.sin(deg);

                var r = data.r, phi = data.phi, theta = data.theta;
                for (var i = 0; i < l; i++) {
                    data.x[i] = obj_1_mass_x + r_1 * Math.sin(theta[i])*Math.cos(phi[i]);
                    data.y[i] = obj_1_mass_y + r_1 * Math.sin(theta[i])*Math.sin(phi[i]);
                    data.z[i] = r_1 * Math.cos(theta[i]);
                }
            }})
            .colorize({using: '', as: grafar.Style.constantColor(0/255,140/255, 240/255)});

    	var animationState = {
    		isActive: false,
    		j: 1,
    		frame: function() {
    			obj_1.constrain(grafar.constant(animationState.j, 'temp'))
    				.refresh();

    			if (animationState.isActive) {
    				window.requestAnimationFrame(animationState.frame);
    			}
    			animationState.j++;
    		}
    	};

    	return animationState;
    }

    var animationControl = prepareAnimation();

    function animate() {
    	if (animationControl.isActive) {
    		animationControl.isActive = false;
    	} else {
    		animationControl.j = 1;
    		animationControl.isActive = true;
    		animationControl.frame();
    	}
    }

	MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
}());
