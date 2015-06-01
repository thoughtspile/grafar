var problems = [
	/*{	id: '1',
		eqn: 'z == x^2 + y^2',
		eqn_comp: function(x, y) {
			return x * x + y * y;
		},
		conditions: 'x + y - 2 == 0',
		intersect_type: 'explicit',
		intersection: [			//First y(t), then z(t), then (if necessary) x(t) 
			function(x) {
				return 2 - x;
			},
			function(x) {
				return 2*x*x - 4*x + 4;
			}
		],
		conditions_form: [function(x, y) {
			return x + y - 2;
		}],
		cond_type: 'explicit',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(x) {
				return 2 - x;
		}],
		lambda: [-2],
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x + y - 2 = 0 $$'
	},*/
	{	id: '1',
		eqn: 'z == x^2 + y^2',
		eqn_comp: function(x, y) {
			return x * x + y * y;
		},
		conditions: 'x + y - 2 == 0',
		intersect_type: 'explicit',
		intersection: [
			function(x) {
				return 2 - x;
			},
			function(x) {
				return 2*x*x - 4*x + 4;
			}
		],
		conditions_form: [
			function(x, y) {
				return x + y - 2;
			}
		],
		cond_type: 'explicit',
		conditions_comp: [
			function(x) {
				return 2 - x;
			}
		],
		lambda: [-2],
		extr_points: {x: [1], y: [1]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x + y - 2 = 0 $$'
	},
	{	id: '2',
		eqn: 'z == x^2 - y^2',
		eqn_comp: function(x, y) {
			return x * x - y * y;
		},
		conditions: '2*x - y - 3',
		intersect_type: 'explicit',
		intersection: [
			function(x) {
				return 2*x - 3;
			},
			function(x) {
				return (-3)*x*x + 12*x - 9;
			}
		],
		conditions_form: [
			function(x, y) {
				return 2*x - y - 3;
			}
		],
		cond_type: 'explicit',
		conditions_comp: [
			function(x) {
				return 2*x - 3;
			}
		],
		lambda: [-2],
		extr_points: {x: [2], y: [1]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ 2x - y - 3 = 0 $$'
	},
	{	id: '3',
		eqn: 'z == 2*(x^3) + 3*(a^2)*x + 2*(y^3) + 3*(a^2)*y',
		eqn_comp: function (x, y) {
				return 2*(x*x*x) + 3*(2*2)*x + 2*(y*y*y) + 3*(2*2)*y;
		},
		conditions: 'x^2 + y^2 - a^2',
		intersect_type: 'polar',
		intersection: [
			function(t) {
				return 2*Math.sin(t);
			},
			function(x, y) {		//Уже написанно в eqn_comp. Скорее всего, без этого можно обойтись
				return 2*(x*x*x) + 3*(2*2)*x + 2*(y*y*y) + 3*(2*2)*y
			},
			function(t) {
				return 2*Math.cos(t);
			}
		],
		conditions_form: [
			function(x, y) {
				return x*x + y*y - 2*2;
			}
		],
		cond_type: 'polar',
		conditions_comp: [
			function(t) {
				return 2 * Math.sin(t);
			},
			function(t) {
				return 2 * Math.cos(t);
			}
		],
		lambda: [-2],
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x^2 + y^2 - a^2 = 0 , a = 2 $$'
	},
	{	id: '47.2 u',
		eqn: 'z == 1/x + 1/y',
		eqn_comp: function (x, y) {
				return 1/x + 1/y;
		},
		conditions: '1/(x^2) + 1/(y^2) - 1/8',
		intersect_type: 'explicit',
		intersection: [
			function(x) {
				if (x < -2*Math.sqrt(2) || x > 2*Math.sqrt(2))
					return Math.sqrt((8*x*x) / (x*x - 8));
				else
					return 0;
			},
			function(x) {
				if (x < -2*Math.sqrt(2) || x > 2*Math.sqrt(2))
					return Math.sqrt(1/8 - 1/(x*x)) + 1/x;
				else
					return 0;
			}
		],
		conditions_form: [
			function(x, y) {
				return 1/(x*x) + 1/(y*y) - 1/8;
			}
		],
		cond_type: 'explicit',
		conditions_comp: [
			function(x) {
				return Math.sqrt((8*x*x) / (x*x - 8));
			}
		],
		lambda: [-1/2],
		info:
		'<strong> Number 47.2 u</strong> \
		<br />Find local extremums in following conditions: \
		$$ \\frac{1}{x^2} + \\frac{1}{y^2} - \\frac{1}{8} = 0 $$'
	},
	{	id: '47.2a',
		eqn: 'z == x/a + y/b',
		eqn_comp: function(x, y) {
			return x / 4 + y / 2;
		},
		conditions: 'x^2 + y^2 - 1',
		intersect_type: 'polar',
		intersection: [
			function(t) {
				return Math.sin(t);
			},
			function(x, y) {
				return x / 4 + y / 2;
			},
			function(t) {
				return Math.cos(t);
			}
		],
		conditions_form: [
			function(x, y) {
				return x*x + y*y - 1;
			}
		],
		cond_type: 'polar',
		conditions_comp: [
			function(t) {
				return Math.sin(t);
			},
			function(t) {
				return Math.cos(t);
			}
		],
		lambda: [0.279508497, -0.279508497], //0.2795, -0.2795
		extr_points: {x: [-1 * Math.pow(1/5, 0.5), Math.pow(1/5, 0.5)],
					y: [-2 * Math.pow(1/5, 0.5), 2 * Math.pow(1/5, 0.5)]},
		info:
		'<strong> Number 47.2 u</strong> \
		<br />Find local extremums in following conditions: \
		$$ x^2 + y^2 - 1 = 0 , a = 4, b = 2 $$'
	},
	{	id: '4',
		eqn: 'z == 2x + 3y',
		eqn_comp: function(x, y) {
			return 2 * x + 3 * y;
		},
		conditions: 'x^2 + y^2 - 1',
		intersect_type: 'polar',
		intersection: [
			function(t) {
				return Math.sin(t);
			},
			function(x, y) {
				return 2 * x + 3 * y;
			},
			function(t) {
				return Math.cos(t);
			}
		],
		conditions_form: [
			function(x, y) {
				return x * x + y * y - 1;
		}],
		cond_type: 'polar',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(t) {
				return Math.sin(t);
			},
			function(t) {
				return Math.cos(t);
			}
		],
		lambda: [1.8027756, -1.8027756],
		extr_points: {x: [-2 * Math.pow(1/13, 0.5), 2 * Math.pow(1/13, 0.5)],
					y: [-3 * Math.pow(1/13, 0.5), 3 * Math.pow(1/13, 0.5)]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x^2 + y^2 = 0 $$'
	},
	{	id: '5',
		eqn: 'z == $$e^(xy)$$',
		eqn_comp: function(x, y) {
			return Math.exp(x * y);
		},
		conditions: 'x^3 + y^3 + x + y - 4',
		intersect_type: 'explicit',
		intersection: [
			function(x) {
				return 0.264567 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, 1/3) - 1.25992 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, -1/3);
			},
			function(x) {
				return Math.exp( x * (0.264567 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, 1/3) - 1.25992 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, -1/3)));
			}
		],
		conditions_form: [
			function(x, y) {
				return x * x * x + y * y * y + x + y - 4;
		}],
		cond_type: 'explicit',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(x) {
				return 0.264567 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, 1/3) - 1.25992 * Math.pow(-27*x*x*x + Math.pow( Math.pow(-27*x*x*x - 27*x + 108, 2) + 108 , 0.5) - 27*x + 108, -1/3);
			}
		],
		lambda: [-Math.E / 4],
		extr_points: {x: [1], y: [1]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x^3 + y^3 + x + y - 4 = 0 $$'
	},
	{	id: '6',
		eqn: 'z == x^2 - y^2',
		eqn_comp: function(x, y) {
			return x * x - y * y;
		},
		conditions: 'x^2 + y^2 - 1',
		intersect_type: 'polar',
		intersection: [
			function(t) {
				return Math.sin(t);
			},
			function(x, y) {
				return x * x - y * y;
			},
			function(t) {
				return Math.cos(t);
			}
		],
		conditions_form: [
			function(x, y) {
				return x * x + y * y - 1;
		}],
		cond_type: 'polar',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(t) {
				return Math.sin(t);
			},
			function(t) {
				return Math.cos(t);
			}
		],
		lambda: [-1, 1],
		extr_points: {x: [0, 0, -1, 1], y: [-1, 1, 0, 0]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x^2 + y^2 = 1 $$'
	},
	{	id: '7',
		eqn: 'z == 3y^3 + 4x^2 - xy',
		eqn_comp: function(x, y) {
			return 3 * y * y * y + 4 * x * x - x * y;
		},
		conditions: 'x + y',
		intersect_type: 'explicit',
		intersection: [
			function(x) {
				return -x;
			},
			function(x) {
				return -3 * x * x * x + 5 * x * x;
			}
		],
		conditions_form: [
			function(x, y) {
				return x + y;
		}],
		cond_type: 'explicit',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(x) {
				return -x;
			}
		],
		lambda: [0, -10],
		extr_points: {x: [0, 10/9], y: [0, -10/9]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ x + y = 0 $$'
	},
	{	id: '8',
		eqn: 'z == 5xy - 4',
		eqn_comp: function(x, y) {
			return 5 * x * y - 4;
		},
		conditions: 'x^2 / 8 + y^2 / 2 - 1',
		intersect_type: 'polar',
		intersection: [
			function(t) {
				return Math.pow(2, 0.5) * Math.sin(t);
			},
			function(x, y) {
				return 5 * x * y - 4;
			},
			function(t) {
				return 2 * Math.pow(2, 0.5) * Math.cos(t);
			}
		],
		conditions_form: [
			function(x, y) {
				return (x * x) / 8 + (y * y) / 2 - 1;
		}],
		cond_type: 'polar',
		conditions_comp: [		//First y(t), then z(t), then (if necessary) x(t)
			function(t) {
				return Math.pow(2, 0.5) * Math.sin(t);
			},
			function(t) {
				return 2 * Math.pow(2, 0.5) * Math.cos(t);
			}
		],
		lambda: [-10],
		extr_points: {x: [2], y: [1]},
		info:
		'<strong> Number </strong> \
		<br />Find local extremums in following conditions: \
		$$ \\frac{x^2}{8} + \\frac{y^2}{2} - 1 = 0 , x > 0, y > 0$$'
	}
];