export const config = {
	debug: false,

	rootGraphId: '$',

	minPanelWidth: 600,
	minPanelHeight: 600,
	container: window,
	antialias: true,

	axes: ['x', 'y', 'z'],
	axisLength: 2,

	particleRadius: 4,

	tweenTime: 900,
	tweenFunction: function(s, e, t) {
		const part = (1 - Math.cos(Math.PI * t / config.tweenTime)) / 2;
		return s * (1 - part) + e * part;
	},

	grafaryaz: {
		samples: 100,
		tol: 0.001,
		samplesPerDOF: 24,
		diffStep: 0.001
	}
}
