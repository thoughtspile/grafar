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

	var pan3d_main = new grafar.Panel(document.getElementById('plot3d_main'));
	pan3d_main.camera.position.set(-8, 15, 10);
	pan3d_main.setAxes(['x', 'y', 'z']);

	var r_1, r_2, С, obj_1_x, obj_2_x;

    function updateUI() {
        var m_1 = parseFloat(document.getElementById('m_blue').value);
        var m_2 = parseFloat(document.getElementById('m_green').value);

        obj_1_x = parseFloat(document.getElementById('sl_b').value);
        obj_2_x = parseFloat(document.getElementById('sl_g').value);

        r_1 = Math.pow(m_1 / 12, 1 / 3);
        r_2 = Math.pow(m_2 / 12, 1 / 3);
        C = (m_1 * obj_1_x + m_2 * obj_2_x) / (m_1 + m_2);

        document.getElementById('res').disabled = true;
        document.getElementById('res').value =  (1 / Math.abs(m_1) + 1 / Math.abs(m_2)).toFixed(2);
        document.getElementById('cent').disabled = true;
        document.getElementById('cent').value =  C;
    }

    // параметризация сферы
    var phi = grafar.range(0, 2 * Math.PI, 25);
    var theta = grafar.range(0, Math.PI, 25);

	updateProblem();

	function updateProblem() {
        updateUI();

		// Первый шарик
    	dynamicSphere = [
            grafar.map([phi, theta], (phi, theta) => obj_1_x + r_1 * Math.sin(theta) * Math.cos(phi)),
            grafar.map([phi, theta], (phi, theta) => r_1 * Math.sin(theta) * Math.sin(phi)),
            grafar.map([phi, theta], (phi, theta) => r_1 * Math.cos(theta))
        ];
        grafar.pin(dynamicSphere, pan3d_main);

		var c1 = [
            grafar.constant(obj_1_x),
    	    grafar.constant(0),
    		grafar.constant(0)
        ];
        grafar.pin(c1, pan3d_main);

		// Второй шарик
    	var staticSphere = [
            grafar.map([phi, theta], (phi, theta) => obj_2_x + r_2 * Math.sin(theta) * Math.cos(phi)),
            grafar.map([phi, theta], (phi, theta) => r_2 * Math.sin(theta) * Math.sin(phi)),
    	    grafar.map([phi, theta], (phi, theta) => r_2 * Math.cos(theta))
        ];
        grafar.pin(staticSphere, pan3d_main);

		var c2 = [
            grafar.constant(obj_1_x),
    		grafar.constant(0),
    		grafar.constant(0)
        ];
        grafar.pin(c2, pan3d_main);

		// Ось
		var line = [
            grafar.seq(-10, 10, 100),
        	grafar.constant(0),
        	grafar.constant(0)
        ];
        grafar.pin(line, pan3d_main);

		// Центр масс
        var cg = [
            grafar.constant(C),
    		grafar.constant(0),
    		grafar.constant(0)
        ];
        grafar.pin(cg, pan3d_main);
	}

    function prepareAnimation() {
    	obj_1_x = parseFloat(document.getElementById('sl_b').value);
    	obj_2_x = parseFloat(document.getElementById('sl_g').value);

    	m_1 = parseFloat(document.getElementById('m_blue').value);
    	m_2 = parseFloat(document.getElementById('m_green').value);

    	C = (m_1 * obj_1_x + m_2 * obj_2_x) / (m_1 + m_2);

        var temp = grafar.constant(0);
        grafar.constrain({ what: dynamicSphere, using: [phi, theta, temp], as: (data, l) => {
            var deg = data[temp][0] * 0.0174533;
            var track = get_track(C, obj_1_x);

            var obj_1_mass_x = C + track * Math.cos(deg);
            var obj_1_mass_y = track * Math.sin(deg);

            var phi_ = data[phi];
            var theta_ = data[theta];
            
            for (var i = 0; i < l; i++) {
                data[dynamicSphere[0]][i] = obj_1_mass_x + r_1 * Math.sin(theta_[i]) * Math.cos(phi_[i]);
                data[dynamicSphere[1]][i] = obj_1_mass_y + r_1 * Math.sin(theta_[i]) * Math.sin(phi_[i]);
                data[dynamicSphere[2]][i] = r_1 * Math.cos(theta_[i]);
            }
        }});

    	var animationState = {
    		isActive: false,
    		j: 1,
    		frame: function() {
    			grafar.constrain(grafar.generators.constant(temp, animationState.j));
                grafar.refresh();

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
