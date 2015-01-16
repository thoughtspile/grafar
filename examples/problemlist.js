var problems = [
	{	
		id: '38.2(a)', 
		model: [
			'x^2/a^2 + y^2/b^2 < 1', 
			'z < c/a*x',
			'z > 0',
			'a == $aval',
			'b == 2',
			'c == 2'],
		tex: [
			'1 &>& \\frac{x^2}{a^2} + \\frac{y^2}{b^2}',
			'z &<& \\frac{c}{a}x',
			'z &>& 0',
			'a &=& \\control{aval}{1}',
			'b &=& 2',
			'c &=& 2']
	}, {
		id: '38.2(б)', 
		model: [
			'x^2 + y^2 < r^2',
			'x/r + z/h < 1',
			'x/r - z/h > -1',
			'y > 0',
			'z > 0',
			'r == $rval',
			'h == 2'],
		tex: [
			'x^2+y^2=R^2', 
			'\\frac{x}{R},+\\frac{z}{H},<1', 
			'\\frac{x}{R},-\\frac{z}{H},<-1', 
			'y=0', 
			'z=0',
			'R=\\control{rval}{2}',
			'h=2']
	}, {
		id: '65.3(a)', 
		model: [
			'x > 0',
			'x < 1',
			'y > 0',
			'x + y < 1',
			'z > 0',
			'x + y - z > 0'],
		tex: [
			'x>0',
			'x<1',
			'y>0',
			'x+y<1',
			'z>0',
			'x+y-z>0']
	}
	//'$$\\int\\limits_{0}^{1} dx \\int\\limits_{0}^{1-x} dy \\int\\limits_{0}^{x+y} f(x,y,z) dz$$'}
];