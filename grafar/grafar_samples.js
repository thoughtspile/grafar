(function(global) {	
	var _G = global.grafar || (global.grafar = {});
	
	var demos = {		
		explicit: [
			'sqrt(x^2+y^2)',
			'exp(x*y)',
			'cos(exp(x*y))',
			'exp(-1/(x^2+y^2))',
			'(x^3+y^4)^(1/3)',
			'sin(exp(x+y)+(x^3+y^3)^(1/3))',
			'cos((x*y)^(1/3))',
			'x*sqrt(.3+(y^2)^(1/3))',
			'x*abs(y)+y*abs(x)',
			'(2*y/(x^2+y^2-1))/5',
			'(x^2*y^2)/(x^2*y^2+(x-y)^2)',
			'(x*y*(x-y)^2)/(x+y)^2',
			'(x^2+y^2)^(x^2*y^2)',
			'x^2*y/(y^2+x^4)',
			'x^2+y^2-x*y',
			'x^2-(y-1)^2',
			'x*y*log(x^2+y^2)',
			'(x*y)^(1/3)',
			'(x+y)/3*sin(5/x)*sin(5/y)',
			'sin(x*y)/x',
			'x^y'
		],
		implicit2: [
			'x^2+y^2=0',
			'1/(x^2+y^2)=0'
		],
		implicit3: [
		],
		systems:[
		],
		vectorFields: [
		],
		paramCurves2: [
		],
		paramCurves3: [
		],
		paramSurfs: [
		],
		complex: [
		]
	};

	
	// export
	
	_G.demos = demos;
}(this));