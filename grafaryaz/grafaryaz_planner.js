'use strict';

(function(global) {
	var _GY = global.grafaryaz || (global.grafaryaz = {}),
		config = _GY.config,
		Table2 = _GY.Table2,
		union = _GY.union,
		setMinus = _GY.setMinus;

	function joinInput(nodes) {
		return nodes.map(function(f) {
				return f.requires;
			})
			.reduce(union, []);
	}
	
	
	function Plan(nodes, targetRef) {
		var target = targetRef.slice(),
			extensions = {},
			prePlan = [],
			counter = -1;
		
		while (target.length !== 0) {
			var stepMaps = [];
			while (target.length !== 0) {
				var name = target[0];
				
				for (var i = 0; i < nodes.length && nodes[i].supplies.indexOf(name) === -1; i++);
				if (i >= nodes.length)
					throw new Error('failed to find variable: ' + name);
					
				var temp = nodes[i],
					supplies = temp.supplies;
				target = setMinus(target, supplies);
				if (temp === undefined)
					throw new Error('variable not specified in any way:' + name);
				
				if (temp.mode === 'eq') {
					stepMaps.push(temp);
				} else if (temp.mode === 'in' || temp.mode === 'implicit') {
					if (!extensions.hasOwnProperty(name))
						extensions[supplies.join()] = {node: temp, last: counter};
					extensions[supplies.join()].first = counter;
				}
			}
			target = joinInput(stepMaps);
			prePlan = [{maps: stepMaps, extenders: []}].concat(prePlan);
			counter--;
		}
		
		Object.getOwnPropertyNames(extensions).forEach(function(names) {
			extensions[names].first += prePlan.length;
			extensions[names].last += prePlan.length;
			prePlan[extensions[names].first].extenders.push(extensions[names].node);
		});
		
		this.steps = prePlan.map(function(rawStep) {
			return new Plan.Step(rawStep.maps, rawStep.extenders);
		});
	}

	Plan.prototype.execute = function() {
		var temp = this.steps.reduce(function(table, step) {
			return step.proceed(table);
		}, new Table2({capacity: 10000}));
		return temp;
	};

	Plan.Step = function(maps, extenders) {
		this.ranges = extenders;
		this.maps = maps;
	};

	Plan.Step.prototype.proceed = function(state) {
		this.maps.forEach(function(map) {
			map.supplies.forEach(function(name) {
				state.addCol(name);
			});
			state.map(map.f());
		});
		this.ranges.forEach(function(extender) {
			var len = (extender.mode === 'in'? config.samples: Math.pow(config.samplesPerDOF, extender.variables.length)),
				temp = new Table2({capacity: len}).setLength(len);
			extender.supplies.forEach(function(name) {
				temp.addCol(name);
			});
			temp.map(extender.f());
			state.times(temp);
		});
		
		return state;
	};
	
	// global
	
	_GY.Plan = Plan;
}(this));